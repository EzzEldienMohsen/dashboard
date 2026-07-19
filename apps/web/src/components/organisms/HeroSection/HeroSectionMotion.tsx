"use client";

import { motion, type Variants } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface HeroSectionMotionProps {
  schoolName: string;
  mission: string;
  ctaStart: string;
  ctaLogin: string;
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroSectionMotion({
  schoolName,
  mission,
  ctaStart,
  ctaLogin,
}: HeroSectionMotionProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.h1
        variants={item}
        className="text-4xl md:text-6xl font-extrabold tracking-tight text-base-content leading-tight max-w-3xl"
      >
        {schoolName}
      </motion.h1>
      {mission ? (
        <motion.p
          variants={item}
          className="text-lg md:text-xl text-base-content/60 max-w-2xl leading-relaxed"
        >
          {mission}
        </motion.p>
      ) : null}
      <motion.div variants={item} className="flex flex-wrap gap-4 justify-center mt-2">
        <Link href="/register" className="btn btn-primary btn-lg">
          {ctaStart}
        </Link>
        <Link href="/login" className="btn btn-outline btn-lg">
          {ctaLogin}
        </Link>
      </motion.div>
    </motion.div>
  );
}
