import { NextResponse } from "next/server";
import {
  getLocalDateKey,
  getNextAlarmISO,
  isCurrentAlarmMinute,
  normalizeTime,
} from "@/lib/alarm-time";
import {
  getUserDailyLog,
  listUsersReadyForAlarm,
  listUsersWithAlarmPreferences,
  updateUserDailyLog,
  updateUserFields,
} from "@/lib/firestore-rest";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const CRON_SECRET = process.env.CRON_SECRET || process.env.BLAND_API_KEY;

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const scheduledUsers = await listUsersReadyForAlarm(nowIso);
    const fallbackCandidates = await listUsersWithAlarmPreferences();
    const usersById = new Map(scheduledUsers.map((user) => [user.id, user]));
    let dueByFallbackCount = 0;

    for (const user of fallbackCandidates) {
      const tz = typeof user.timezone === "string" ? user.timezone : "UTC";
      const pref = normalizeTime(user.time, tz);
      if (!pref) continue;

      if (user.pendingSnooze && user.pendingSnoozeRequestedAt) {
        const requestedAt = new Date(user.pendingSnoozeRequestedAt);

        if (Number.isNaN(requestedAt.getTime())) {
          await updateUserFields(user.id, {
            pendingSnooze: false,
            pendingSnoozeRequestedAt: null,
          });
          usersById.delete(user.id);
          continue;
        }

        const snoozeUntil = new Date(
          requestedAt.getTime() + (user.snoozeMinutes || 5) * 60 * 1000
        ).toISOString();

        await updateUserFields(user.id, {
          nextAlarmTime: snoozeUntil,
          pendingSnooze: false,
          pendingSnoozeRequestedAt: null,
        });

        if (snoozeUntil <= nowIso) {
          usersById.set(user.id, {
            ...user,
            nextAlarmTime: snoozeUntil,
            pendingSnooze: false,
            pendingSnoozeRequestedAt: undefined,
          });
        } else {
          usersById.delete(user.id);
        }
        continue;
      }

      if (usersById.has(user.id)) continue;

      if (!isCurrentAlarmMinute(pref.hours, pref.minutes, pref.timezone, now)) continue;

      // Self-heal older docs whose derived nextAlarmTime was computed incorrectly.
      const expectedNextAlarm = getNextAlarmISO(pref.hours, pref.minutes, pref.timezone, now);
      if (user.nextAlarmTime !== expectedNextAlarm) {
        usersById.set(user.id, user);
        dueByFallbackCount += 1;
      }
    }

    const users = Array.from(usersById.values());
    const triggered: string[] = [];
    const skipped: Array<{ id: string; reason: string }> = [];
    const pathwayId =
      process.env.BLAND_PATHWAY_ID || process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID;

    for (const user of users) {
      if (!user.phone) {
        skipped.push({ id: user.id, reason: "missing_phone" });
      } else if (!pathwayId) {
        skipped.push({ id: user.id, reason: "missing_pathway_id" });
      } else {
        try {
          const tz = typeof user.timezone === "string" ? user.timezone : "UTC";
          const pref = normalizeTime(user.time, tz);
          const timezone = pref?.timezone || tz;
          const dateKey = getLocalDateKey(now, timezone);
          const dailyLog = await getUserDailyLog(user.id, dateKey);

          await updateUserDailyLog(user.id, dateKey, {
            date: dateKey,
            timezone,
            triggeredCallTimes: [...(dailyLog?.triggeredCallTimes || []), nowIso],
            snoozeTimes: dailyLog?.snoozeTimes || [],
            snoozeCount: dailyLog?.snoozeCount || 0,
            checkedInAt: dailyLog?.checkedInAt,
          });

          const res = await fetch("https://api.bland.ai/v1/calls", {
            method: "POST",
            headers: {
              Authorization: process.env.BLAND_API_KEY || "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone_number: user.phone,
              pathway_id: pathwayId,
            }),
          });
          const blandRes: unknown = await res.json();
          if (!res.ok) {
            skipped.push({ id: user.id, reason: "bland_call_failed" });
            console.error("Failed to trigger bland call for user", user.id, blandRes);
          } else {
            triggered.push(user.id);
          }
        } catch (err) {
          skipped.push({ id: user.id, reason: "bland_call_error" });
          console.error("Error triggering bland call:", err);
        }
      }

      // Reschedule from user's preferred time + timezone so we stay consistent with DB.
      const tz = typeof user.timezone === "string" ? user.timezone : "UTC";
      const pref = normalizeTime(user.time, tz);
      const nextAlarmTime = pref
        ? getNextAlarmISO(pref.hours, pref.minutes, pref.timezone, new Date())
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await updateUserFields(user.id, {
        nextAlarmTime,
        pendingSnooze: false,
        pendingSnoozeRequestedAt: null,
      });
    }

    return NextResponse.json({
      success: true,
      count: triggered.length,
      triggered,
      dueCount: users.length,
      dueByNextAlarmCount: scheduledUsers.length,
      dueByFallbackCount,
      skipped,
    });
  } catch (error: unknown) {
    console.error("Trigger error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
