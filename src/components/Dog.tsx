"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

const IMG_DOG1 = "/images/Dog 1.png";
const IMG_DOG2 = "/images/Dog 2.png";
const IMG_DOG3 = "/images/Dog 3.png";
const IMG_DOG4 = "/images/Dog 4.png";
const IMG_DOG5 = "/images/Dog 5.png";

const images = [IMG_DOG1, IMG_DOG2, IMG_DOG3, IMG_DOG4, IMG_DOG5];

export default function Dog({
  x,
  y,
  begin,
  width,
  height,
}: {
  x: number;
  y: number;
  begin: number;
  width: number;
  height: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = images[currentIndex];
  const [start, setStart] = useState(0);
  const [style, setStyle] = useState("absolute inset-0 scale-x-[1] object-top");

  // State for relative movement
  const [targetValue, setTargetValue] = useState(begin);
  const [yValue, setYValue] = useState(y);

  // 1. Sprite Animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      if (begin > x && start == 0) {
        setStyle("absolute inset-0 scale-x-[-1] object-top");
        setStart(1);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [currentIndex, start, begin, x]);

  // 2. Movement Logic (Relative Wandering)
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Use window width to calculate a relative target in pixels
      const screenWidth =
        typeof window !== "undefined" ? window.innerWidth : 1200;
      const minX = -150;
      const maxX = screenWidth + 150;

      const oldValue = targetValue;
      const newValue = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

      // Keep them lower: We add 20-40px to the baseline 'y'
      const newY = y + 30 + (Math.floor(Math.random() * 40) - 20);

      setYValue(newY);
      setTargetValue(newValue);

      if (oldValue < newValue) {
        setStyle("absolute inset-0 scale-x-[-1] object-top");
      } else {
        setStyle("absolute inset-0 scale-x-[1] object-top");
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [targetValue, y]);

  return (
    <motion.div
      initial={{
        y: "63vh", // Starts 70% down (30% up from bottom)
        x: `${x}px`,
      }}
      animate={{
        // Uses vh for position to stay relative to screen height
        // Dividing yValue by a larger number like 8 or 9
        // will keep them in that lower 30% zone.
        y: `${yValue / 8.5}vh`,
        x: `${targetValue}px`,
        zIndex: Math.round(yValue),
      }}
      transition={{ duration: 10, ease: "linear" }}
      style={{
        // Changed from vw to vh so size only changes with view height
        // Using a multiplier like 0.15vh to make them slightly larger
        width: `${width * 0.1}vh`,
        height: "auto",
        position: "absolute",
        transform: "translate(-50%, -50%)",
      }}
    >
      <img src={currentImage} alt="" className={style} />
    </motion.div>
  );
}
