"use client";

import { useState } from "react";
import SceneBackground from "@/components/SceneBackground";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const IMG_CLOCK = "/images/clock.png";

export default function CheckInPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckIn = async () => {
    if (!user || isCheckingIn) return;

    setIsCheckingIn(true);
    setMessage(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const json = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setMessage(json.error || "Check-in failed.");
        return;
      }

      router.push("/home-page");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Check-in failed."
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <SceneBackground>
      <div className="relative flex min-h-dvh w-full flex-col items-center justify-start pt-[12%]">
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={!user || isCheckingIn}
          className="flex w-full flex-col items-center disabled:cursor-not-allowed"
          aria-label="Check in"
        >
          <h2 className="mb-4 text-center text-xl font-semibold text-black md:text-2xl">
            {isCheckingIn ? "Checking in..." : "Click the clock to check in"}
          </h2>
          <div
            className="relative h-[28vh] w-[28vw] min-w-[140px] max-w-[200px] md:h-[32vh] md:w-[26vw]"
          >
            <img
              alt="Clock"
              className="size-full object-contain object-bottom"
              src={IMG_CLOCK}
            />
          </div>
        </button>
        {message && (
          <p className="mt-6 rounded bg-white/80 px-3 py-2 text-center text-sm font-bold text-gray-800">
            {message}
          </p>
        )}
      </div>
    </SceneBackground>
  );
}
