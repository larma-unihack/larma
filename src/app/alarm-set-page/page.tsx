"use client";

import { useState } from "react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import Hamburger from "@/components/Hamburger";

const SPEECH_BUBBLE = "/images/speech_bubble.png";
const IMG_DOG = "/images/dog_sitting.png";

function formatTime(h: number, m: number) {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function AlarmSetPage() {
  const [hours, setHours] = useState(9);
  const [minutes, setMinutes] = useState(26);

  const handleHoursUp = () => setHours((h) => (h === 23 ? 0 : h + 1));
  const handleHoursDown = () => setHours((h) => (h === 0 ? 23 : h - 1));
  const handleMinutesUp = () => {
    setMinutes((m) => {
      if (m === 59) {
        setHours((h) => (h === 23 ? 0 : h + 1));
        return 0;
      }
      return m + 1;
    });
  };
  const handleMinutesDown = () => {
    setMinutes((m) => {
      if (m === 0) {
        setHours((h) => (h === 0 ? 23 : h - 1));
        return 59;
      }
      return m - 1;
    });
  };

  return (
    <SceneBackground>
      <div className="relative min-h-screen w-full">
        <Hamburger />

        <div
          className="pointer-events-none absolute left-[28%] top-[38%] h-[30%] w-[26%] md:left-[32%] md:top-[40%] md:h-[32%] md:w-[22%]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-contain object-bottom"
            src={IMG_DOG}
          />
        </div>

        <div className="absolute left-[38%] top-[12%] flex h-[32%] w-[52%] max-w-[320px] items-center justify-center md:left-[42%] md:top-[14%] md:h-[30%] md:w-[44%]">
          <div className="relative h-full w-full">
            <img
              alt=""
              className="pointer-events-none absolute inset-0 size-full object-contain object-center"
              src={SPEECH_BUBBLE}
            />
            <div className="absolute left-[18%] right-[18%] top-[15%] bottom-[28%] flex items-center justify-center gap-2 sm:gap-3">
              <span
                className="tabular-nums text-[clamp(1rem,4vw,1.75rem)] font-semibold text-gray-800"
                aria-live="polite"
              >
                {formatTime(hours, minutes)}
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  aria-label="Increase time"
                  className="rounded p-0.5 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                  onClick={handleMinutesUp}
                >
                  <svg className="size-5 sm:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Decrease time"
                  className="rounded p-0.5 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                  onClick={handleMinutesDown}
                >
                  <svg className="size-5 sm:size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
              <Link
                href="/home-page"
                aria-label="Confirm alarm time"
                className="rounded p-1 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
              >
                <svg className="size-6 sm:size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SceneBackground>
  );
}
