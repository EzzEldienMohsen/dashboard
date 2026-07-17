"use client";

import { motion } from "framer-motion";

export function LogoMark() {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 0 4px color-mix(in srgb, var(--color-primary) 30%, transparent)",
      }}
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content font-bold text-sm select-none cursor-default"
      aria-hidden="true"
    >
      ED
    </motion.div>
  );
}
