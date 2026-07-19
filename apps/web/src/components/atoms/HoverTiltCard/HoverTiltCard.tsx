"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface HoverTiltCardProps {
  children: ReactNode;
  className?: string;
}

/** Generic hover-lift wrapper for card-like content — subtle rise + scale on hover. */
export function HoverTiltCard({ children, className }: HoverTiltCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
