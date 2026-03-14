"use client";

import { useState } from "react";
import HomeView from "@/components/HomeView";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Render the core UI, but pass the start state */}
      <HomeView hasStarted={hasStarted} />

      {/* 3. PLAY BUTTON OVERLAY */}
      {!hasStarted && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
          <button
            onClick={() => setHasStarted(true)}
            className="group relative block transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              viewBox="0 0 100 100"
              className="block h-28 w-28 drop-shadow-2xl"
              fill="none"
            >
              <circle cx="50" cy="50" r="50" fill="#94d82d" />
              <path d="M42 30 L42 70 L72 50 Z" fill="#2b5a07" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
