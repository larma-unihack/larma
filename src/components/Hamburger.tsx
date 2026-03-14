"use client";

import { useState } from "react";
import PopOutWindow from "@/components/PopOutWindow";

export default function Hamburger({
  onClick,
  className = "",
  "aria-label": ariaLabel = "Open menu",
}: {
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onClick?.();
  };

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={["fixed right-4 top-4 z-10 flex size-10 flex-col items-center justify-center gap-1.5 rounded border-0 bg-white/90 shadow-md", className].filter(Boolean).join(" ")}
        onClick={handleOpen}
      >
        <span className="h-0.5 w-5 bg-gray-800" aria-hidden />
        <span className="h-0.5 w-5 bg-gray-800" aria-hidden />
        <span className="h-0.5 w-5 bg-gray-800" aria-hidden />
      </button>
      <PopOutWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
