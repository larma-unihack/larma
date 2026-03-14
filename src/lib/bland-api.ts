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

    const response = await fetch("/blandai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        startTime: finalDate ? finalDate.toISOString() : undefined,
        pathwayId: process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID,
      }),
    });

    const result = (await response.json()) as any;

    if (!response.ok) {
      throw new Error(result.error || "Failed to schedule call");
    }

    return result;
  } catch (error) {
    console.error("Bland API Helper Error:", error);
    throw error;
  }
}
