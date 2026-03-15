
const IMG_DOG1 = "/images/Dog 1.png";
const IMG_DOG2 = "/images/Dog 2.png";
const IMG_DOG3 = "/images/Dog 3.png";
const IMG_DOG4 = "/images/Dog 4.png";
const IMG_DOG5 = "/images/Dog 5.png";

import { motion, useMotionValueEvent, useMotionValue, useInstantTransition } from "motion/react";
import { useState, useEffect } from "react";

import Image from "next/image";
import { style } from "motion/react-client";
import { randomInt } from "crypto";

const MotionImage = motion.create(Image);


const images = [IMG_DOG1, IMG_DOG2, IMG_DOG3, IMG_DOG4, IMG_DOG5];


export default function Dog({ x, y, begin, width, height }: { x: number, y: number, begin: number, width: number, height: number }) {
  const horizontal = useMotionValue(0);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = images[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const [start, setStart] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      nextImage();
      if (begin > x && start == 0) {
        setStyle("absolute inset-0 scale-x-[-1] object-top")
        setStart(1)
      }
    }, 100)
    return () => clearTimeout(timeout)
  }, [currentIndex, start])

  const [style, setStyle] = useState("absolute inset-0 scale-x-[1] object-top")


  const [targetValue, setTargetValue] = useState(begin);
  const [yValue, setYValue] = useState(y);


  horizontal.set(begin)



  useEffect(() => {
    const timeout = setTimeout(() => {
      const value = targetValue;
      const newValue = Math.floor(Math.random() * 1700) - 400;
      const newY = Math.floor(Math.random() * 50) + 500 + (250-width);
      setYValue(newY)
      setTargetValue(newValue);
      const z = newY - (250-width)
      if (value <  newValue) {
        setStyle("absolute inset-0 scale-x-[-1] object-top z-"+ z)
      } else if (value > newValue) {
        setStyle("absolute inset-0 scale-x-[1] object-top z-"+ z)
      }
      horizontal.set(targetValue);
    }, 10000)
    return () => clearTimeout(timeout);
  }, [horizontal, targetValue, yValue]);


  return (
    <motion.div
      initial={{ y: y, x: x }}
      animate={{
        y: yValue,
        // x: [x>0?x-200:0, x<0?x+200:"100%", x>0?x-200:0],
        x: targetValue,

        zIndex: 1,
      }}
      transition={{ duration: 10 }}
      style={{ width: width, height: height, position: "absolute" }}
    >
      {/* <MotionImage
          src={currentImage}
          alt="Animated scene element"
          width={500}
          height={300}
          initial={{ opacity: 1, y: y }}
          animate={{ opacity: 1, y: y }}
          transition={{ duration: 0 }}
        /> */}

      <img
        src={currentImage}
        alt=""
        className={style}
      />
    </motion.div>
  )


}