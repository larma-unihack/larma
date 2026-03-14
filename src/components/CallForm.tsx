"use client";

import { useState } from "react";
import { scheduleCall } from "../lib/bland-api";

export default function CallForm() {
  const [phone, setPhone] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Determine if the selected time is valid for scheduling
  const isTooSoon =
    selectedTime && (new Date(selectedTime).getTime() - Date.now()) / 60000 < 5;

  const handleCall = async () => {
    if (!phone) return alert("Please enter a phone number");

    setLoading(true);
    setMessage("");

    try {
      // If within 5 mins, we pass undefined to trigger an instant call
      const date =
        selectedTime && !isTooSoon ? new Date(selectedTime) : undefined;

      const data = await scheduleCall(phone, date);

      // Better success message handling
      if (data.mode === "Instant" || data.scheduledAt === "Immediate") {
        setMessage(`🚀 Success! Calling you right now.`);
      } else {
        const localDate = new Date(data.scheduledAt).toLocaleString();
        setMessage(`📅 Success! Scheduled for: ${localDate}`);
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto border rounded-xl shadow-sm bg-white text-black">
      <h2 className="text-xl font-bold mb-4">Larma AI Alarm</h2>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="+1 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">
            Schedule Time
          </label>
          <input
            type="datetime-local"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-1"
          />

          {/* THE NOTE: Informing the user about the 5-min rule */}
          <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-700">
            {!selectedTime
              ? "💡 Leave blank to receive a call immediately."
              : isTooSoon
                ? "⚠️ This is less than 5 mins away. We'll call you IMMEDIATELY instead."
                : "✅ This is more than 5 mins away. Your call will be scheduled."}
          </div>
        </div>

        <button
          onClick={handleCall}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-md disabled:opacity-50 transition-all mt-2"
        >
          {loading
            ? "Processing..."
            : selectedTime && !isTooSoon
              ? "Schedule Alarm"
              : "Call Me Now"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm mt-2 ${message.includes("Error") ? "bg-red-50 text-red-500" : "bg-green-50 text-green-700"}`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
