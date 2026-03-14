import SceneBackground from "@/components/SceneBackground";
import Link from "next/link";
import Hamburger from "@/components/Hamburger";

const SPEECH_BUBBLE = "/images/speech_bubble.png";
const IMG_DOG = "/images/dog_sitting.png";
const IMG_SQUARE = "/images/home_page_square.png";

export default function HomePage() {
  return (
    <SceneBackground>
      <div className="relative min-h-screen w-full">
      <Hamburger />

      <div
        className="absolute left-[4%] top-[8%] h-[50%] w-[32%] max-w-[260px] md:left-[5%] md:top-[10%] md:h-[55%] md:w-[28%]"
        aria-hidden
      >
        <img
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-contain object-center"
          src={IMG_SQUARE}
        />
        <Link
          href="/set-alarm-time"
          className="absolute left-[15%] right-[15%] top-[12%] bottom-[52%] flex cursor-pointer items-center justify-center"
        >
          <p className="text-center text-[clamp(0.65rem,1.8vw,1rem)] font-medium leading-tight text-gray-800">
            Set Alarm Time
          </p>
        </Link>
        <div className="pointer-events-none absolute left-[15%] right-[15%] top-[48%] bottom-[12%] flex items-center justify-center">
          <p className="text-center text-[clamp(0.65rem,1.8vw,1rem)] font-medium leading-tight text-gray-800">
            Average Snoozes Per Day: 2
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 flex h-full items-start justify-center pt-[10%] md:justify-end md:pr-[12%] md:pt-[12%]">
        <div
          className="pointer-events-none relative h-[28%] w-[45%] max-w-[280px] md:h-[32%] md:w-[28%]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-contain object-center"
            src={SPEECH_BUBBLE}
          />
          <div className="absolute left-[22%] right-[10%] top-[12%] bottom-[32%] flex items-center justify-center">
            <p className="text-center text-[clamp(0.75rem,2.2vw,1.35rem)] font-medium leading-tight text-gray-800">
              Health: 50%
            </p>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-[42%] top-[38%] h-[28%] w-[24%] md:left-[58%] md:top-[40%] md:h-[32%] md:w-[20%]"
        aria-hidden
      >
        <img
          alt=""
          className="absolute inset-0 size-full object-contain object-bottom"
          src={IMG_DOG}
        />
      </div>
      </div>
    </SceneBackground>
  );
}
