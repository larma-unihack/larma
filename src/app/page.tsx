"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import { useRouter } from "next/navigation";

import { motion } from "motion/react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import { useState, useEffect } from "react";
import Image from "next/image";

const MotionImage = motion(Image);

const IMG_DOG1 = "/images/Dog 1.png";
const IMG_DOG2 = "/images/Dog 2.png";
const IMG_DOG3 = "/images/Dog 3.png";
const IMG_DOG4 = "/images/Dog 4.png";
const IMG_DOG5 = "/images/Dog 5.png";
const IMG_TREE = "/images/tree.png";

const PLAY_CIRCLE_FILL = "var(--light-green)";
const PLAY_TRIANGLE_FILL = "var(--dark-green)";

const images = [IMG_DOG1, IMG_DOG2, IMG_DOG3, IMG_DOG4, IMG_DOG5];

export default function Home() {
  const { user, openLoginModal, setOpenLoginModal } = useAuth();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = images[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    const timeout = setTimeout(() => nextImage(), 100)
    return () => clearTimeout(timeout)
  }, [currentIndex])

  return (
    <div
      className={`opening-page fixed inset-0 flex flex-col items-center justify-center bg-white ${openLoginModal ? "" : "overflow-hidden"
        }`}
    >
      <div className="opening-page__canvas relative flex-shrink-0 overflow-hidden">
        <SceneBackground>
          <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-transparent">
            <div className="pointer-events-none relative size-full flex-shrink-0 overflow-hidden">

              <motion.div
                initial={{ y: 300, x: 100 }}
                animate={{
                  y: 300,
                  x: [0, 100, 0],
                  zIndex: 1,
                }}
                transition={{ duration: 5 }}
                style={{ width: 100, height: 100 }}
              >
                <MotionImage
                  src={currentImage}
                  alt="Animated scene element"
                  width={500}
                  height={300}
                  initial={{ opacity: 1, y: 200 }}
                  animate={{ opacity: 1, y: 200 }}
                  transition={{ duration: 0 }}
                />

                <img
                  alt=""
                  className="absolute inset-0 scale-x-[-1] object-top"
                />
              </motion.div>

              <button
                type="button"
                onClick={nextImage}
                className="pointer-events-auto absolute top-4 left-4 bg-black text-white px-3 py-1 rounded"
              >
                Next Image
              </button>

              <p className="absolute left-1/2 top-[10.74%] w-full max-w-full -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[22vw] leading-none not-italic text-black sm:text-[18vw] md:text-[clamp(80px,13vw,256px)]">
                larma
              </p>

              <div
                className="pointer-events-none absolute left-[52%] top-[45%] h-[37.5%] w-[21.09%] overflow-hidden md:left-[67.5%]"
                aria-hidden
              >
                <img
                  alt=""
                  className="absolute inset-0 size-[67%] object-contain object-bottom"
                  src={IMG_DOG2}
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

              <button
                type="button"
                onClick={() => {
                  if (user) {
                    router.push("/home-page");
                  } else {
                    setOpenLoginModal(true);
                  }
                }}
                aria-label="Play"
                className="pointer-events-auto absolute left-1/2 top-[36%] block h-[22%] w-[22%] max-w-[120px] -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa3bff] md:left-[44.53%] md:top-[38.33%] md:h-[19.44%] md:w-[10.94%] md:max-w-none md:translate-x-0"
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
              </button>

            </div>
          </div>
        </SceneBackground>

        <LoginModal
          open={openLoginModal}
          onClose={() => setOpenLoginModal(false)}
        />
      </div>
    </div>
  );
}
