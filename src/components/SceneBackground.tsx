"use client";

const IMG_SKY = "/images/sky_bright.png";
const IMG_GROUND = "/images/ground.png";

/**
 * Shared sky + ground background. Use the same wrapper so it looks identical
 * on opening page and dashboard. Put page-specific content inside as children.
 */
export default function SceneBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="opening-page fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="opening-page__canvas relative flex-shrink-0 overflow-hidden">
        {/* Sky */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[72%] w-full overflow-hidden opacity-90 shadow-[0px_4px_200px_0px_rgba(0,0,0,0.15)] md:h-[66.76%]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
            src={IMG_SKY}
          />
        </div>

        {/* Ground */}
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

        {children}
      </div>
    </div>
  );
}
