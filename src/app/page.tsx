"use client";

/* Figma: UniHack2 Opening Page - Real (node-id=1-3). Responsive: %-based layout, full width. */
const IMG_BG = "/images/sky_bright.png";
const IMG_MOUNTAIN =
  "https://www.figma.com/api/mcp/asset/667c79f3-bad8-4f0e-acc7-70106e7b6239";
const IMG_DOGS =
  "https://www.figma.com/api/mcp/asset/78192275-a9df-4389-83bd-8287ff7ff289";
const IMG_GROUND = "/images/ground.png";

/* Play button colors (vector style, matches pixel-art green) */
const PLAY_CIRCLE_FILL = "#569629";
const PLAY_TRIANGLE_FILL = "#2d4f15";

export default function Home() {
  return (
    <div className="opening-page fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="opening-page__canvas relative flex-shrink-0 overflow-hidden">
        {/* Sky — full width, top ~67% of canvas */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[66.76%] w-full overflow-hidden opacity-90 shadow-[0px_4px_200px_0px_rgba(0,0,0,0.15)]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
            src={IMG_BG}
          />
        </div>

        {/* Overlay */}
        <div
          className="pointer-events-none absolute left-[16.09%] top-[29.91%] h-[59.44%] w-[50.16%] opacity-30"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover"
            src={IMG_MOUNTAIN}
          />
        </div>

        {/* Ground — full width, bottom ~33% */}
        <div
          className="pointer-events-none absolute left-0 top-[66.76%] h-[33.24%] w-full overflow-hidden"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover [object-position:50%_22%]"
            src={IMG_GROUND}
          />
        </div>

        {/* Title — bigger on mobile, scales on larger screens */}
        <p
          className="absolute left-1/2 top-[10.74%] w-full -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[22vw] leading-none not-italic text-black sm:text-[18vw] md:text-[clamp(80px,13vw,256px)]"
          data-node-id="1:7"
        >
          larma
        </p>

        {/* Play button — vector circle + triangle */}
        <a
          href="#play"
          aria-label="Play"
          className="absolute left-[44.53%] top-[38.33%] block h-[19.44%] w-[10.94%] cursor-pointer transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa3bff]"
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
            {/* Right-pointing play triangle, centered with slight right nudge */}
            <path
              d="M40 26 L40 74 L74 50 Z"
              fill={PLAY_TRIANGLE_FILL}
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
