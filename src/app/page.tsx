"use client";

import { motion } from "motion/react"
import Link from "next/link";

/* Figma: UniHack2 Opening Page - Real (node-id=1-3). Responsive: %-based layout, full width. */
const IMG_BG = "/images/sky_bright.png";
const IMG_MOUNTAIN =
  "https://www.figma.com/api/mcp/asset/667c79f3-bad8-4f0e-acc7-70106e7b6239";
const IMG_DOGS =
  "/images/dog_sitting.png";
const IMG_GROUND = "/images/ground.png";
const IMG_TREE = "/images/tree.png";

/* Play button colors (vector style, matches pixel-art green) */
const PLAY_CIRCLE_FILL = "#569629";
const PLAY_TRIANGLE_FILL = "#2d4f15";

export default function OpeningPage() {
  return (
    <div className="opening-page fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="opening-page__canvas relative flex-shrink-0 overflow-hidden">
        {/* Sky — more height on mobile so ground feels less dominant */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[72%] w-full overflow-hidden opacity-90 shadow-[0px_4px_200px_0px_rgba(0,0,0,0.15)] md:h-[66.76%]"
          aria-hidden
        >
          
            <img
              alt=""
              className="absolute inset-0 size-full object-cover object-top"
              src={IMG_BG}
            />
        </div>

         {/* Left dog — nudge right on mobile so not cut off by portrait crop */}
        <div
          className="pointer-events-none absolute left-[4%] top-[33.43%] h-[37.5%] w-[21.09%] overflow-hidden md:left-0"
          aria-hidden
        >
          <motion.div 
            initial = {{ y: 100, x: 0}}
            animate = {{ y:100, x: 100}}
            transition = {{ duration:1 }}
          >
            <img
              alt=""
              className="inset-0 size-full scale-x-[-1] object-contain object-bottom z-index-0"
              src={IMG_DOGS}
            />
          </motion.div>

        </div>


        {/* Mountain — on mobile: anchored at horizon (bottom at ground line), not floating */}
        <div
          className="pointer-events-none absolute left-[20%] top-[52%] h-[20%] w-[60%] opacity-30 md:left-[16.09%] md:top-[29.91%] md:h-[59.44%] md:w-[50.16%]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover object-bottom"
            src={IMG_MOUNTAIN}
          />
        </div>

        {/* Ground — full width, bottom section */}
        <div
          className="pointer-events-none absolute left-0 top-[66.76%] h-[33.24%] w-full overflow-hidden"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover object-top [object-position:50%_22%]"
            src={IMG_GROUND}
          />
        </div>

        {/* Title — centered horizontally on all screens */}
        <p
          className="absolute left-1/2 top-[10.74%] w-full max-w-full -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[22vw] leading-none not-italic text-black sm:text-[18vw] md:text-[clamp(80px,13vw,256px)]"
          data-node-id="1:7"
        >
          larma
        </p>

       

        {/* Right dog — centre-right on mobile, fully on screen */}
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

        {/* Tree — centre-left on mobile; desktop position unchanged */}
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
          type="button"
          aria-label="Play"
          className="absolute left-1/2 top-[36%] block h-[22%] w-[22%] max-w-[120px] -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa3bff] md:left-[44.53%] md:top-[38.33%] md:h-[19.44%] md:w-[10.94%] md:max-w-none md:translate-x-0"
          data-node-id="1:8"
        >
          <svg
            viewBox="0 0 100 100"
            className="block size-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle
              cx="50"
              cy="50"
              r="50"
              fill={PLAY_CIRCLE_FILL}
            />
            <path
              d="M40 26 L40 74 L74 50 Z"
              fill={PLAY_TRIANGLE_FILL}
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
