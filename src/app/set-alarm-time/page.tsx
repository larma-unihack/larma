"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SceneBackground from "@/components/SceneBackground";
import Hamburger from "@/components/Hamburger";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { scheduleCall } from "@/lib/bland-api";

const SPEECH_BUBBLE = "/images/speech_bubble.png";
const IMG_DOG = "/images/dog_sitting.png";

function formatTime(h: number, m: number) {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function parseTimeInput(value: string): { hours: number; minutes: number } | null {
  const trimmed = value.trim();
  const withColon = trimmed.includes(":");
  const parts = withColon ? trimmed.split(":") : [trimmed.slice(0, 2) || "0", trimmed.slice(2) || "0"];
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hours: h, minutes: m };
}

export default function SetAlarmTimePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [time, setTime] = useState({ hours: 9, minutes: 26 });
  const { hours, minutes } = time;
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayValue = isInputFocused ? inputValue : formatTime(hours, minutes);

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleTimeInputBlur = () => {
    const parsed = parseTimeInput(inputValue);
    if (parsed) {
      setTime({ hours: parsed.hours, minutes: parsed.minutes });
    }
    setInputValue("");
    setIsInputFocused(false);
  };

  const handleTimeInputFocus = () => {
    setInputValue(formatTime(hours, minutes));
    setIsInputFocused(true);
  };

  const handleMinutesUp = () => {
    setTime((prev) => {
      const { hours: h, minutes: m } = prev;
      if (m === 59) return { hours: h === 23 ? 0 : h + 1, minutes: 0 };
      return { hours: h, minutes: m + 1 };
    });
  };
  const handleMinutesDown = () => {
    setTime((prev) => {
      const { hours: h, minutes: m } = prev;
      if (m === 0) return { hours: h === 0 ? 23 : h - 1, minutes: 59 };
      return { hours: h, minutes: m - 1 };
    });
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Please log in to set an alarm.");
      return;
    }
    if (!db) {
      alert("Database not initialized.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || !userDoc.data().phone) {
        alert("Please set up a phone number in your account first.");
        setIsSubmitting(false);
        return;
      }
      const phone = userDoc.data().phone;

      const now = new Date();
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      if (targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const result = await scheduleCall(phone, targetDate);

      await updateDoc(doc(db, "users", user.uid), {
        alarmTime: targetDate.toISOString(),
        blandCallId: result.call_id
      });

      router.push("/home-page");
    } catch (err: any) {
      alert("Failed to confirm alarm: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <SceneBackground>
      <div className="relative min-h-screen w-full">
        <Hamburger />

        {/* Dog on grass, slightly left of center */}
        <div
          className="pointer-events-none absolute left-[28%] top-[38%] h-[30%] w-[26%] md:left-[32%] md:top-[40%] md:h-[32%] md:w-[22%]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-contain object-bottom"
            src={IMG_DOG}
          />
        </div>

        {/* Speech bubble above dog: time + up/down arrows + checkmark */}
        <div className="absolute left-[38%] top-[12%] flex h-[32%] w-[52%] max-w-[320px] items-center justify-center md:left-[42%] md:top-[14%] md:h-[30%] md:w-[44%]">
          <div className="relative h-full w-full">
            <img
              alt=""
              className="pointer-events-none absolute inset-0 size-full object-contain object-center"
              src={SPEECH_BUBBLE}
            />
            <div className="absolute left-[18%] right-[18%] top-[15%] bottom-[28%] flex items-center justify-center gap-2 sm:gap-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="9:26"
                value={displayValue}
                onChange={handleTimeInputChange}
                onFocus={handleTimeInputFocus}
                onBlur={handleTimeInputBlur}
                aria-label="Alarm time"
                aria-live="polite"
                className="input input-bordered input-sm w-full max-w-[5.5rem] flex-shrink-0 border-2 border-white bg-white text-center tabular-nums text-[var(--dark-green)] placeholder:text-[var(--dark-green)]/60 focus:border-[var(--dark-green)] [font-size:clamp(0.875rem,3vw,1.5rem)]"
              />
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  aria-label="Increase time"
                  className="btn btn-circle btn-sm btn-ghost text-[var(--dark-green)] hover:bg-white hover:text-[var(--light-green)]"
                  onClick={handleMinutesUp}
                >
                  <svg className="size-5 sm:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Decrease time"
                  className="btn btn-circle btn-sm btn-ghost text-[var(--dark-green)] hover:bg-white hover:text-[var(--light-green)]"
                  onClick={handleMinutesDown}
                >
                  <svg className="size-5 sm:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                aria-label="Confirm alarm time"
                className="btn btn-circle btn-sm border-2 border-[var(--dark-green)] bg-[var(--light-green)] text-white hover:bg-[var(--dark-green)] hover:border-[var(--light-green)] hover:text-[var(--light-green)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg className="size-6 sm:size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SceneBackground>
  );
}
