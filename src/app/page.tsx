"use client";

import { motion } from "motion/react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";

const IMG_DOGS = "/images/dog_sitting.png";
const IMG_TREE = "/images/tree.png";
const PLAY_CIRCLE_FILL = "#569629";
const PLAY_TRIANGLE_FILL = "#2d4f15";

export default function OpeningPage() {
  return (
    <SceneBackground>
      <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-transparent">
      <div className="pointer-events-none relative size-full flex-shrink-0 overflow-hidden">

        <div
          className="pointer-events-none absolute z-1"
          aria-hidden
        >
          <motion.div 
            initial = {{ y: 350, x: 0}}
            animate = {{ y:350, x: 100}}
            transition = {{ duration:1 }}
          >
            <img
              alt=""
              className="inset-0 scale-x-[-1] object-top"
              src={IMG_DOGS}
            />
          </motion.div>

        </div>

      <p
        className="absolute left-1/2 top-[10.74%] w-full max-w-full -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[22vw] leading-none not-italic text-black sm:text-[18vw] md:text-[clamp(80px,13vw,256px)]"
        data-node-id="1:7"
      >
        larma
      </p>

      <div
        className="pointer-events-none absolute left-[52%] top-[45%] h-[37.5%] w-[21.09%] overflow-hidden md:left-[67.5%]"
        aria-hidden
      >
        <img
          alt=""
          className="absolute inset-0 size-[67%] object-contain object-bottom"
          src={IMG_DOGS}
        />
      </div>

      <div
        className="pointer-events-none absolute left-[32%] top-[30.5%] h-[37.5%] w-[24%] overflow-visible md:left-[77.5%] md:w-[21.09%]"
        aria-hidden
      >
        <img
          alt=""
          className="absolute bottom-0 left-1/2 size-[100%] -translate-x-1/2 object-contain object-bottom md:size-[150%]"
          src={IMG_TREE}
        />
      </div>

      <Link
        href="/home-page"
        aria-label="Play"
        className="pointer-events-auto absolute left-1/2 top-[36%] block h-[22%] w-[22%] max-w-[120px] -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa3bff] md:left-[44.53%] md:top-[38.33%] md:h-[19.44%] md:w-[10.94%] md:max-w-none md:translate-x-0"
        data-node-id="1:8"
      >
        <svg
          viewBox="0 0 100 100"
          className="block size-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="50" cy="50" r="50" fill={PLAY_CIRCLE_FILL} />
          <path d="M40 26 L40 74 L74 50 Z" fill={PLAY_TRIANGLE_FILL} />
        </svg>
      </Link>
      </div>
      </div>
    </SceneBackground>
  );
}
