"use client";

const SKY_IMAGES = {
  bright: "/images/sky_bright.png",
  dark: "/images/dark-sky.png",
  "ultra-dark": "/images/ultra-dark-sky.png",
} as const;

const IMG_GROUND = "/images/ground.png";
const IMG_MOUNTAIN = "/images/mountain.png";

export type SkyVariant = keyof typeof SKY_IMAGES;

export default function SceneBackground({
  children,
  skyVariant = "bright",
}: {
  children: React.ReactNode;
  skyVariant?: SkyVariant;
}) {
  const skySrc = SKY_IMAGES[skyVariant];

  return (
    <div className="opening-page fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="opening-page__canvas relative h-full w-full flex-shrink-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 h-[72%] w-full overflow-hidden opacity-90 md:h-[66.76%]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
            src={skySrc}
          />
          {/* Shadow stays behind the mountain */}
          <div className="absolute inset-0 shadow-[0px_4px_200px_0px_rgba(0,0,0,0.15)]" />
        </div>

        {/* 2. MOUNTAIN (Smooth, Sync Scaling)
            - We removed the 'md:' height jump.
            - By using a consistent h-[75%] of the sky container, it scales linearly.
            - 'items-end' keeps it pinned to the ground as the screen grows.
        */}
        <div
          className="pointer-events-none absolute inset-0 z-10 h-[72%] w-full overflow-hidden md:h-[66.76%] flex items-end justify-center"
          aria-hidden
        >
          <img
            alt=""
            /* h-[75%]: The mountain will always be 75% of the sky's height.
               w-auto: Ensures it never stretches horizontally.
               z-10: Guarantees the peak is in front of the 'blue' shadow.
            */
            className="h-[75%] w-auto max-w-[90%] object-contain object-bottom opacity-30 pixel-art transition-all duration-500 ease-in-out"
            src={IMG_MOUNTAIN}
          />
        </div>

        {/* 3. GROUND (Front layer) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[33.24%] w-full overflow-hidden z-20"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover object-top [object-position:50%_22%] pixel-art"
            src={IMG_GROUND}
          />
        </div>

        {/* 4. UI Layer */}
        <div className="relative z-30 h-full w-full">{children}</div>
      </div>
    </div>
  );
}
