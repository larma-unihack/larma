"use client";

import { motion, Transition } from "motion/react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import { cursorTo } from "readline";
import { useEffect, useState } from "react"
import Image from 'next/image'


const IMG_DOGS = "/images/dog_sitting.png";
const IMG_TREE = "/images/tree.png";
const PLAY_CIRCLE_FILL = "#569629";
const PLAY_TRIANGLE_FILL = "#2d4f15";

const images = [
  IMG_DOGS,
  IMG_TREE
]


const MotionImage = motion(Image)



export default function OpeningPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    var prevIndex = currentIndex;
    setCurrentIndex((prevIndex + 1) % images.length);

  };

  // 
  useEffect(() => {
    const timeout = setTimeout(() => { nextImage(); console.log("Dog" + currentIndex); }, 3000)
    return () => clearTimeout(timeout)
  }, [currentIndex])

  // setTimeout(() => {
  //   console.log('This message is displayed after a 2-second delay');
  // }, 2000);

  const currentImage = images[currentIndex];





  return (
    <SceneBackground>
      <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-transparent">
        <div className="pointer-events-none relative size-full flex-shrink-0 overflow-hidden">
          <motion.div
            initial={{ y: 200, x: 0 }}
            transition={{ duration: 10 }}

            animate={{
              y: 200, x: 50,
              // : 'red',
              // currentIndex ? currentImage[0]: currentImage[1],
              scale: [1, 1.2, 1],
              zIndex: 1,

            }}
            style={{ width: 100, height: 100 }}
          >
            <MotionImage
              src={currentImage}
              alt="Description"
              width={500}
              height={300}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
            <img
              alt=""
              className="absolute inset-0 scale-x-[-1] object-top"
            />
          </motion.div>

          <button type="button" onClick={() => nextImage}>Next Image</button>


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
