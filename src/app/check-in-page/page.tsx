"use client";

import SceneBackground from "@/components/SceneBackground";
import Link from "next/link";

const IMG_CLOCK = "/images/clock.png";

export default function CheckInPage() {
  return (
    <SceneBackground>
      <div className="relative flex min-h-dvh w-full flex-col items-center justify-start pt-[12%]">
        <Link
          href="/home-page"
          className="flex w-full flex-col items-center"
        >
          <h2 className="mb-4 text-center text-xl font-semibold text-black md:text-2xl">
            Click the clock to check in
          </h2>
          <div
            className="relative h-[28vh] w-[28vw] min-w-[140px] max-w-[200px] md:h-[32vh] md:w-[26vw]"
            aria-hidden
          >
            <img
              alt="Clock"
              className="size-full object-contain object-bottom"
              src={IMG_CLOCK}
            />
          </div>
        </Link>
      </div>
    </SceneBackground>
  );
}
