"use client";

import SceneBackground from "@/components/SceneBackground";
import Link from "next/link";
import Hamburger from "@/components/Hamburger";

const SPEECH_BUBBLE = "/images/speech_bubble.png";
const IMG_DOG = "/images/dog_sitting.png";
const IMG_SQUARE = "/images/home_page_square.png";

interface HomeViewProps {
  hasStarted?: boolean;
}

export default function HomeView({ hasStarted = true }: HomeViewProps) {
  return (
    <SceneBackground>
      <div className="absolute inset-0 flex flex-col overflow-hidden min-h-dvh w-full">
        {hasStarted && <Hamburger />}

        <div
          className="absolute left-[4%] top-[10%] h-[40vh] w-[35vw] max-w-[260px] md:w-[25vw]"
          aria-hidden
        >
          <img
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-contain"
            src={IMG_SQUARE}
          />
          <div className="absolute inset-0 flex flex-col p-[10%]">
            <Link
              href="/set-alarm-time"
              className={`flex h-1/2 items-center justify-center text-center ${!hasStarted ? "pointer-events-none" : "cursor-pointer"}`}
            >
              <p className="text-[clamp(0.6rem,1.8vw,1rem)] font-medium text-gray-800">
                Set Alarm Time
              </p>
            </Link>
            <div className="flex h-1/2 items-center justify-center text-center">
              <p className="text-[clamp(0.55rem,1.6vw,0.9rem)] font-medium text-gray-800">
                Avg Snoozes: 2
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[28%] right-[5%] flex h-[40vh] aspect-[1/1.2] flex-col items-center justify-end md:right-auto md:left-[58%] md:h-[45vh]">
          <div
            className={`relative w-full h-[40%] transition-all duration-300 ${
              hasStarted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="relative h-full w-full">
              <img
                alt=""
                className="pointer-events-none absolute inset-0 size-full object-contain"
                src={SPEECH_BUBBLE}
              />
              <div className="absolute inset-0 flex items-center justify-center pb-[18%] pr-[5%]">
                <p className="text-center text-[clamp(0.7rem,2.2vh,1.1rem)] font-bold text-gray-800">
                  Health: 50%
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[65%] w-full mt-[-5%]">
            <img
              alt="Dog"
              className="size-full object-contain object-bottom"
              src={IMG_DOG}
            />
          </div>
        </div>
      </div>
    </SceneBackground>
  );
}
