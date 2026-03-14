export async function scheduleCall(phoneNumber: string, date?: Date) {
  try {
    let finalDate = date;

    // 1. Check the "5-minute rule"
    if (finalDate) {
      const now = new Date();
      // Calculate difference in minutes
      const diffMins = (finalDate.getTime() - now.getTime()) / 60000;

      // If the time is in the past or less than 5 mins away,
      // wipe the date so it defaults to an instant call.
      if (diffMins < 5) {
        console.log("Time is too close to now; switching to instant call.");
        finalDate = undefined;
      }
    }

    // 2. Send the request
    const response = await fetch("/blandai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        // If finalDate was wiped above, this becomes undefined/omitted
        startTime: finalDate ? finalDate.toISOString() : undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to schedule call");
    }

    return result;
  } catch (error) {
    console.error("Bland API Helper Error:", error);
    throw error;
  }
}
