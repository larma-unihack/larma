import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getNextAlarmISO, normalizeTime } from "@/lib/alarm-time";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const CRON_SECRET = process.env.CRON_SECRET || process.env.BLAND_API_KEY;

        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: "Admin DB not initialized" }, { status: 500 });
        }

        const nowIso = new Date().toISOString();

        const usersRef = adminDb.collection("users");
        const qs = await usersRef.where("nextAlarmTime", "<=", nowIso).get();

        const triggered = [];

        for (const userDoc of qs.docs) {
            const data = userDoc.data();
            triggered.push(userDoc.id);

            // Trigger the call via Bland
            if (data.phone) {
                try {
                    const res = await fetch("https://api.bland.ai/v1/calls", {
                        method: "POST",
                        headers: {
                            "Authorization": process.env.BLAND_API_KEY || "",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            phone_number: data.phone,
                            pathway_id: process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID,
                        }),
                    });
                    const blandRes = (await res.json()) as any;
                    if (!res.ok) {
                        console.error("Failed to trigger bland call for user", userDoc.id, blandRes);
                    }
                } catch (err) {
                    console.error("Error triggering bland call:", err);
                }
            }

            // Reschedule from user's preferred time + timezone so we stay consistent with DB.
            const tz = typeof data.timezone === "string" ? data.timezone : "UTC";
            const pref = normalizeTime(data.time, tz);
            const nextAlarmTime = pref
                ? getNextAlarmISO(pref.hours, pref.minutes, pref.timezone, new Date())
                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            await adminDb.collection("users").doc(userDoc.id).update({
                nextAlarmTime,
            });
        }

        return NextResponse.json({ success: true, count: triggered.length, triggered });
    } catch (error: any) {
        console.error("Trigger error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}
