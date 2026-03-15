"use client";

import { useState } from "react";
import SceneBackground, { type SkyVariant } from "@/components/SceneBackground";
import Link from "next/link";
import Hamburger from "@/components/Hamburger";
import { useAlarmStatus } from "@/hooks/useAlarmStatus";
import Dog from "@/components/Dog";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getLocalDateKey, getNextDayAlarmISO, normalizeTime } from "@/lib/alarm-time";
// import "../app/global.css";

const SPEECH_BUBBLE = "/images/speech_bubble.png";
const IMG_DOG = "/images/dog_sitting.png";
const IMG_HEART = "/images/heart.gif";
const IMG_SLEEP = "/images/sleep.gif";

interface HomeViewProps {
  hasStarted?: boolean;
}

function formatAlarmTime(alarmTime: string | null): string {
  if (!alarmTime) return "—";
  if (alarmTime.includes("T")) {
    try {
      const d = new Date(alarmTime);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  }
  return alarmTime;
}

function getSkyVariant(health: number | null): SkyVariant {
  if (health == null) return "bright";
  if (health >= 70) return "bright";
  if (health >= 40) return "dark";
  return "ultra-dark";
}

function clampHealth(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export default function HomeView({ hasStarted = true }: HomeViewProps) {
  const { alarmSet, alarmTime, phone, loading, health, snoozeMinutes } = useAlarmStatus();
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState<string | null>(null);
  const showSquareContent = !loading && !alarmSet;
  const showHearts = health != null && health >= 50;
  const showSleep = health != null && health < 50;
  const skyVariant = getSkyVariant(health);

  const handleCheckIn = async () => {
    if (!user?.uid || !db || isCheckingIn) return;

    setIsCheckingIn(true);
    setCheckInMessage(null);

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      const timezone =
        typeof data?.timezone === "string"
          ? data.timezone
          : Intl.DateTimeFormat().resolvedOptions().timeZone;
      const pref = normalizeTime(data?.time, timezone);

      if (!pref) {
        setCheckInMessage("Set your alarm first.");
        return;
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const dateKey = getLocalDateKey(now, pref.timezone);
      const dailyLogRef = doc(db, "users", user.uid, "dailyLogs", dateKey);
      const dailyLogSnap = await getDoc(dailyLogRef);
      const dailyLog = dailyLogSnap.data();
      const snoozeCount =
        typeof dailyLog?.snoozeCount === "number" ? dailyLog.snoozeCount : 0;
      const currentHealth =
        typeof data?.health === "number" ? clampHealth(data.health) : 100;
      const nextHealth =
        snoozeCount === 0 ? clampHealth(currentHealth + 10) : currentHealth;

      await setDoc(
        dailyLogRef,
        {
          date: dateKey,
          timezone: pref.timezone,
          triggeredCallTimes: Array.isArray(dailyLog?.triggeredCallTimes)
            ? dailyLog.triggeredCallTimes
            : [],
          snoozeTimes: Array.isArray(dailyLog?.snoozeTimes)
            ? dailyLog.snoozeTimes
            : [],
          snoozeCount,
          checkedInAt: nowIso,
        },
        { merge: true }
      );

      await updateDoc(userRef, {
        health: nextHealth,
        nextAlarmTime: getNextDayAlarmISO(
          pref.hours,
          pref.minutes,
          pref.timezone,
          now
        ),
        pendingSnooze: false,
        pendingSnoozeRequestedAt: null,
      });

      setCheckInMessage("Checked in.");
    } catch {
      setCheckInMessage("Check-in failed.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <SceneBackground skyVariant={skyVariant}>
      <div className="absolute inset-0 flex flex-col overflow-hidden min-h-dvh w-full">
        {hasStarted && <Hamburger />}

        <div
          className="absolute left-[2%] top-[1%] h-[30vh] w-[38vw] sm:left-[3%] sm:top-[9%] sm:h-[35vh] sm:min-h-[180px] sm:w-[36vw] sm:max-w-[240px] md:left-[4%] md:top-[10%] md:h-[40vh] md:min-h-[200px] md:w-[25vw] md:max-w-[260px] lg:max-w-[280px]"
          aria-hidden
        >

          {showSquareContent && (
            <div className="absolute inset-0 size-full object-contain bg-light-green">
              {/* Top white section */}
              <Link
                href="/set-alarm-time"
                className={`absolute left-[14%] right-[14%] top-[15%] flex h-[30%] items-center justify-center text-center ${!hasStarted ? "pointer-events-none" : "cursor-pointer"} bg-white`}
              >
                <p className="max-w-full text-xs leading-tight text-gray-800 sm:text-xl md:text-md text-wrap">
                  Set Alarm Time
                </p>
              </Link>
              {/* Bottom white section */}
              <div className=" absolute bottom-[15%] left-[14%] right-[14%] flex h-[30%] items-center justify-center text-center bg-white">
                <p className="max-w-full text-xs leading-tight text-gray-800 sm:text-lg md:text-md text-wrap">
                  Avg Snoozes: 2
                </p>
              </div>
            </div>
          )}
          {!loading && alarmSet && (
            <div className="absolute inset-0 size-full object-contain bg-light-green">
              <Link
                href="/set-alarm-time"
                className="absolute left-[12%] right-[12%] top-[10%] flex h-[20%] items-center justify-center text-center cursor-pointer hover:opacity-90 bg-white"
                aria-label="Change alarm time"
              >
                <p className="max-w-full  text-xs font-medium leading-tight text-gray-800 font-bold sm:text-2xl md:text-lg line-clamp-xl">
                  Alarm Time: {formatAlarmTime(alarmTime)}
                </p>
              </Link>
              <div className="absolute left-[12%] right-[12%] top-[40%] flex h-[20%] items-center justify-center text-center bg-white">
                <p
                  className="max-w-full truncate text-xs text-wrap font-medium leading-tight font-bold text-gray-800 sm:text-2xl md:text-xl"
                  title={phone ?? undefined}
                >
                  Phone: {phone ?? "—"}
                </p>
              </div>
              <div className="absolute left-[12%] right-[12%] bottom-[10%] flex h-[20%] items-center justify-center text-center bg-white">
                <p className="max-w-full text-xs font-medium leading-tight text-gray-800 sm:text-2xl md:text-xl">
                  Snooze: {snoozeMinutes} min
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-[28%] right-[5%] flex h-[40vh] aspect-[1/1.2] flex-col items-center justify-end md:right-auto md:left-[58%] md:h-[45vh]">
          <div
            className={`relative w-full h-[40%] transition-all duration-300 ${
              hasStarted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="relative h-full w-full">
              <img
                alt=""
                className="pointer-events-none absolute inset-0 size-full object-contain"
                src={SPEECH_BUBBLE}
              />
              <div className="absolute inset-0 flex items-center justify-center pb-[18%] pr-[5%]">
                <p className="text-center text-[clamp(0.7rem,2.2vh,1.1rem)] font-bold text-gray-800">
                  Health: {health != null ? `${health}%` : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[65%] w-full mt-[-5%]">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isCheckingIn || !alarmSet || !user}
              className="relative z-10 size-full disabled:cursor-not-allowed"
              aria-label="Check in with your dog"
            >
              <img
                alt="Dog"
                className="relative z-10 size-full object-contain object-bottom"
                src={IMG_DOG}
              />
            </button>
            {showHearts && (
              <div
                className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center"
                aria-hidden
              >
                <img
                  alt=""
                  className="absolute top-[6%] left-[18%] h-[10%] min-h-[50px] w-auto -translate-x-1/2 object-contain md:top-[8%] md:h-[12%]"
                  src={IMG_HEART}
                />
                <img
                  alt=""
                  className="absolute top-[6%] left-[38%] h-[10%] min-h-[58px] w-auto -translate-x-1/2 object-contain md:top-[8%] md:h-[12%]"
                  src={IMG_HEART}
                />
                <img
                  alt=""
                  className="absolute top-[6%] left-[58%] h-[10%] min-h-[50px] w-auto -translate-x-1/2 object-contain md:top-[8%] md:h-[12%]"
                  src={IMG_HEART}
                />
              </div>
            )}
            {showSleep && (
              <div
                className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center"
                aria-hidden
              >
                <img
                  alt=""
                  className="absolute top-[5%] left-1/2 h-[10%] min-h-[58px] w-auto -translate-x-1/2 object-contain md:top-[6%] md:h-[12%]"
                  src={IMG_SLEEP}
                />
                <img
                  alt=""
                  className="absolute top-[8%] left-[32%] h-[9%] min-h-[50px] w-auto object-contain md:top-[10%] md:left-[35%] md:h-[11%]"
                  src={IMG_SLEEP}
                />
                <img
                  alt=""
                  className="absolute top-[8%] right-[32%] h-[9%] min-h-[50px] w-auto object-contain md:top-[10%] md:right-[35%] md:h-[11%]"
                  src={IMG_SLEEP}
                />
              </div>
            )}
            {checkInMessage && (
              <p className="pointer-events-none absolute bottom-[-10%] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded bg-white/80 px-2 py-1 text-xs font-bold text-gray-800">
                {checkInMessage}
              </p>
            )}
          </div>
        </div>
      </div>
      <Dog x={300} y={460} begin={800} width={200} height={200} />
      <Dog x={500} y={460} begin={500} width={200} height={100} />
      <Dog x={500} y={555} begin={200} width={80} height={100} />
    </SceneBackground>
  );
}
