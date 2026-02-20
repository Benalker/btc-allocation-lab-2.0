"use client";

import { motion } from "framer-motion";
import type { Profile } from "@/lib/api";
import InfoPopover from "@/components/ui/InfoPopover";

interface Props {
  value: Profile;
  onChange: (value: Profile) => void;
  showInfo?: boolean;
}

const OPTIONS: { value: Profile; label: string; emoji: string }[] = [
  { value: "conservative", label: "Conservative", emoji: "🛡️" },
  { value: "balanced",     label: "Balanced",     emoji: "⚖️" },
  { value: "growth",       label: "Growth",       emoji: "🚀" },
];

export default function SegmentedControl({
  value,
  onChange,
  showInfo = true,
}: Props) {
  const activeIndex = OPTIONS.findIndex((o) => o.value === value);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
        {/* Sliding pill */}
        <motion.div
          className="absolute bottom-1 top-1 rounded-xl bg-white/[0.12]"
          animate={{
            left: `calc(${activeIndex * (100 / 3)}% + 4px)`,
            width: `calc(${100 / 3}% - 8px)`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />

        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors duration-200 ${
              value === opt.value
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <span className="text-base leading-none">{opt.emoji}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        ))}
      </div>
      {showInfo && <InfoPopover contentKey="profile" />}
    </div>
  );
}
