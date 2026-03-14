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
    const { phoneNumber, pathwayId } = await request.json();

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
