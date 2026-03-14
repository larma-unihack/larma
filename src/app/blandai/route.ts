import { NextResponse } from "next/server";

type BlandResponse = {
  status: "success" | "error";
  call_id: string;
};

export async function POST(request: Request) {
  try {
    // 1. Grab secret from root .env.local (Local) or Vercel (Prod)
    const BLAND_AI_KEY = process.env.BLAND_API_KEY;

    if (!BLAND_AI_KEY) {
      return NextResponse.json(
        { error: "API Key not configured" },
        { status: 500 },
      );
    }

    // 2. Parse the body from your frontend fetch()
    const { phoneNumber, pathwayId, startTime, previousCallId } = await request.json() as { phoneNumber: string, pathwayId: string, startTime?: string, previousCallId?: string };

    // 2.5 Stop previous call if it exists
    if (previousCallId) {
      try {
        await fetch(`https://api.bland.ai/v1/calls/${previousCallId}/stop`, {
          method: "POST",
          headers: {
            Authorization: BLAND_AI_KEY
          }
        });
      } catch (e) {
        console.error("Failed to cancel previous Bland AI call", e);
      }
    }

    // 3. The actual API call to Bland
    const response = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: BLAND_AI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        pathway_id: pathwayId,
        ...(startTime && { start_time: startTime }),
      }),
    });

    const data = (await response.json()) as BlandResponse;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
