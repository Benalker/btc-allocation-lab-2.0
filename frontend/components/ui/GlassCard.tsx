"use client";

import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  as?: "div" | "section" | "article";
}

export default function GlassCard({
  hoverable = false,
  children,
  className = "",
  ...rest
}: GlassCardProps) {
  const base =
    "rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl";
  const shadow =
    "[box-shadow:0_4px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]";

  if (!hoverable) {
    return (
      <div className={`${base} ${shadow} ${className}`} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`${base} ${shadow} ${className}`}
      whileHover={{ scale: 1.005, borderColor: "rgba(255,255,255,0.14)" }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      {...(rest as object)}
    >
      {children}
    </motion.div>
  );
}
