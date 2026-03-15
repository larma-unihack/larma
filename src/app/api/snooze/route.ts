import { NextResponse } from "next/server";
import { getLocalDateKey, normalizeTime } from "@/lib/alarm-time";
import {
  findUserByPhone,
  getUserDailyLog,
  updateUserDailyLog,
  updateUserFields,
} from "@/lib/firestore-rest";

function clampHealth(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.BLAND_SNOOZE_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "BLAND_SNOOZE_WEBHOOK_SECRET is not configured." },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { phone_number?: unknown };
    const phoneNumber =
      typeof body.phone_number === "string" ? body.phone_number.trim() : "";

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phone_number is required." },
        { status: 400 }
      );
    }

    const user = await findUserByPhone(phoneNumber);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const timezone =
      normalizeTime(user.time, user.timezone || "UTC")?.timezone ||
      user.timezone ||
      "UTC";
    const dateKey = getLocalDateKey(now, timezone);
    const currentLog = await getUserDailyLog(user.id, dateKey);
    const snoozeTimes = [...(currentLog?.snoozeTimes || []), nowIso];
    const snoozeCount = snoozeTimes.length;
    const nextHealth =
      snoozeCount > 1
        ? clampHealth((user.health ?? 100) - 10)
        : clampHealth(user.health ?? 100);

    await updateUserDailyLog(user.id, dateKey, {
      date: dateKey,
      timezone,
      triggeredCallTimes: currentLog?.triggeredCallTimes || [],
      snoozeTimes,
      snoozeCount,
      checkedInAt: currentLog?.checkedInAt,
    });

    await updateUserFields(user.id, {
      health: nextHealth,
      pendingSnooze: true,
      pendingSnoozeRequestedAt: nowIso,
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      snoozeCount,
      health: nextHealth,
    });
  } catch (error: unknown) {
    console.error("Snooze webhook error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
