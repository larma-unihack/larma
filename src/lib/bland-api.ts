export async function scheduleCall(phoneNumber: string, date?: Date) {
  try {
    let finalDate = date;

    if (finalDate) {
      const now = new Date();
      const diffMins = (finalDate.getTime() - now.getTime()) / 60000;

      if (diffMins < 5) {
        console.log("Time is too close to now; switching to instant call.");
        finalDate = undefined;
      }
    }

    const payload: Record<string, any> = {
      phoneNumber,
      pathwayId: process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID,
    };
    if (finalDate) {
      payload.startTime = finalDate.toISOString();
    }
    const response = await fetch("/api/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as any;

    if (!response.ok) {
      throw new Error(result.error || result.message || "Failed to schedule call");
    }

    return result;
  } catch (error) {
    console.error("Bland API Helper Error:", error);
    throw error;
  }
}
