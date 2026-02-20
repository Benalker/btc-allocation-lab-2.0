"use client";

import { motion } from "framer-motion";
import InfoPopover from "@/components/ui/InfoPopover";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  infoKey?: string;
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  infoKey,
}: Props) {
  const pct = Math.round(value * 100);
  const fillPct = ((value - min) / (max - min)) * 100;

  function handleNumber(raw: string) {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    const clamped = Math.max(min, Math.min(max, n / 100));
    const stepped = Math.round(clamped / step) * step;
    onChange(parseFloat(stepped.toFixed(4)));
  }

  return (
    <motion.div
      className="space-y-2 rounded-2xl border border-transparent p-3 transition-colors"
      whileHover={{
        borderColor: "rgba(139,92,246,0.25)",
        backgroundColor: "rgba(139,92,246,0.04)",
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label className="text-sm font-medium text-white/60">{label}</label>
          {infoKey && <InfoPopover contentKey={infoKey} />}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={pct}
            min={Math.round(min * 100)}
            max={Math.round(max * 100)}
            onChange={(e) => handleNumber(e.target.value)}
            className="w-12 rounded-lg border border-white/10 bg-white/10 px-1.5 py-0.5 text-right text-sm font-semibold text-white outline-none transition-colors focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30"
          />
          <span className="text-sm text-white/40">%</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          background: `linear-gradient(to right, rgb(139 92 246) ${fillPct}%, rgba(255 255 255 / 0.12) ${fillPct}%)`,
        }}
        className="w-full"
      />
    </motion.div>
  );
}
