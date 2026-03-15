"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  getLocalDateKey,
  normalizeSnoozeMinutes,
  normalizeTime,
} from "@/lib/alarm-time";

export function useAlarmStatus(): {
  alarmSet: boolean;
  alarmTime: string | null;
  phone: string | null;
  health: number | null;
  snoozeMinutes: number;
  hasCheckedInToday: boolean | null;
  loading: boolean;
} {
  const { user } = useAuth();
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmTime, setAlarmTime] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [health, setHealth] = useState<number | null>(null);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = user?.uid;
    const firestore = db;
    let unsubscribeDailyLog: (() => void) | null = null;

    if (!uid || !firestore) {
      queueMicrotask(() => {
        setAlarmSet(false);
        setAlarmTime(null);
        setPhone(null);
        setHealth(null);
        setSnoozeMinutes(5);
        setHasCheckedInToday(null);
        setLoading(false);
      });
      return;
    }

    const unsubscribe = onSnapshot(
      doc(firestore, "users", uid),
      (userDoc) => {
        const data = userDoc.data();
        const next = data?.nextAlarmTime;
        const tz =
          typeof data?.timezone === "string"
            ? data.timezone
            : Intl.DateTimeFormat().resolvedOptions().timeZone;
        const pref = normalizeTime(data?.time, tz);
        const hasAlarm = Boolean(next ?? pref);
        setAlarmSet(hasAlarm);
        if (pref) {
          setAlarmTime(
            `${pref.hours.toString().padStart(2, "0")}:${pref.minutes.toString().padStart(2, "0")}`
          );
        } else if (typeof next === "string") {
          setAlarmTime(next);
        } else {
          setAlarmTime(null);
        }
        setPhone(typeof data?.phone === "string" ? data.phone : null);
        const healthVal = data?.health;
        if (typeof healthVal === "number" && healthVal >= 0 && healthVal <= 100) {
          setHealth(healthVal);
        } else if (typeof healthVal === "number") {
          setHealth(Math.min(100, Math.max(0, healthVal)));
        } else {
          setHealth(100);
        }
        setSnoozeMinutes(normalizeSnoozeMinutes(data?.snoozeMinutes));

        if (unsubscribeDailyLog) {
          unsubscribeDailyLog();
          unsubscribeDailyLog = null;
        }

        if (!pref) {
          setHasCheckedInToday(null);
          setLoading(false);
          return;
        }

        const dateKey = getLocalDateKey(new Date(), pref.timezone);
        unsubscribeDailyLog = onSnapshot(
          doc(firestore, "users", uid, "dailyLogs", dateKey),
          (dailyLogDoc) => {
            const checkedInAt = dailyLogDoc.data()?.checkedInAt;
            setHasCheckedInToday(
              typeof checkedInAt === "string" && checkedInAt.length > 0
            );
          },
          () => {
            setHasCheckedInToday(false);
          }
        );

        setLoading(false);
      },
      () => {
        if (unsubscribeDailyLog) {
          unsubscribeDailyLog();
          unsubscribeDailyLog = null;
        }
        setAlarmSet(false);
        setAlarmTime(null);
        setPhone(null);
        setHealth(null);
        setSnoozeMinutes(5);
        setHasCheckedInToday(null);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeDailyLog) {
        unsubscribeDailyLog();
      }
      unsubscribe();
    };
  }, [user?.uid]);

  return {
    alarmSet,
    alarmTime,
    phone,
    health,
    snoozeMinutes,
    hasCheckedInToday,
    loading,
  };
}
