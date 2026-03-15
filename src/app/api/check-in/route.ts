import { NextResponse } from "next/server";
import {
  getLocalDateKey,
  getNextDayAlarmISO,
  normalizeTime,
} from "@/lib/alarm-time";
import {
  getUserById,
  getUserDailyLog,
  updateUserDailyLog,
  updateUserFields,
} from "@/lib/firestore-rest";

function clampHealth(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function isAuthError(message: string): boolean {
  return (
    message === "Unauthorized" ||
    message === "INVALID_ID_TOKEN" ||
    message === "TOKEN_EXPIRED" ||
    message === "USER_DISABLED"
  );
}

async function authenticateUserId(request: Request): Promise<string> {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";

  if (!idToken) {
    throw new Error("Unauthorized");
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    }
  );

  const json = (await response.json()) as {
    users?: Array<{ localId?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(json.error?.message || "Unauthorized");
  }

  const userId = json.users?.[0]?.localId;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function POST(request: Request) {
  try {
    const userId = await authenticateUserId(request);
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const fallbackTimezone =
      typeof user.timezone === "string" ? user.timezone : "UTC";
    const pref = normalizeTime(user.time, fallbackTimezone);

    if (!pref) {
      return NextResponse.json(
        { error: "Set your alarm first." },
        { status: 400 }
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const dateKey = getLocalDateKey(now, pref.timezone);
    const dailyLog = await getUserDailyLog(userId, dateKey);
    const nextAlarmTime = getNextDayAlarmISO(
      pref.hours,
      pref.minutes,
      pref.timezone,
      now
    );

    if (dailyLog?.checkedInAt) {
      await updateUserFields(userId, {
        lastCheckedInDate: dateKey,
        nextAlarmTime,
      });
      return NextResponse.json({ success: true, alreadyCheckedIn: true });
    }

    const snoozeCount =
      typeof dailyLog?.snoozeCount === "number" ? dailyLog.snoozeCount : 0;
    const currentHealth =
      typeof user.health === "number" ? clampHealth(user.health) : 100;
    const nextHealth =
      snoozeCount === 0 ? clampHealth(currentHealth + 10) : currentHealth;

    await updateUserDailyLog(userId, dateKey, {
      date: dateKey,
      timezone: pref.timezone,
      triggeredCallTimes: dailyLog?.triggeredCallTimes || [],
      responseTimes: dailyLog?.responseTimes || [],
      snoozeResponseTimes: dailyLog?.snoozeResponseTimes || [],
      wakeUpResponseTimes: dailyLog?.wakeUpResponseTimes || [],
      snoozeCount,
      checkedInAt: nowIso,
      lastResponseAt: dailyLog?.lastResponseAt,
      lastResponseIsSnooze: dailyLog?.lastResponseIsSnooze,
    });

    await updateUserFields(userId, {
      health: nextHealth,
      lastCheckedInDate: dateKey,
      nextAlarmTime,
    });

    return NextResponse.json({ success: true, alreadyCheckedIn: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error";
    const status = isAuthError(message) ? 401 : 500;
    const safeMessage = isAuthError(message) ? "Please sign in again." : message;
    console.error("Manual check-in error:", error);
    return NextResponse.json({ error: safeMessage }, { status });
  }
}
