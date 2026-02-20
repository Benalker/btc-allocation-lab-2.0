"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { GLOSSARY } from "@/content/glossary";

interface InfoPopoverProps {
  contentKey: string;
}

export default function InfoPopover({ contentKey }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const entry = GLOSSARY[contentKey];

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!entry) return null;

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Info: ${entry.title}`}
        className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[10px] font-bold text-white/40 transition-all hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        i
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#1a1a30]/95 p-4 shadow-2xl backdrop-blur-2xl"
          role="tooltip"
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#1a1a30]" />

          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-400">
            {entry.title}
          </p>
          <p className="text-sm leading-relaxed text-white/80">{entry.short}</p>

          {(entry.whenHigher || entry.whenLower) && (
            <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
              {entry.whenHigher && (
                <div className="flex gap-2 text-xs text-white/60">
                  <span className="mt-0.5 flex-shrink-0 text-green-400">↑</span>
                  <span>{entry.whenHigher}</span>
                </div>
              )}
              {entry.whenLower && (
                <div className="flex gap-2 text-xs text-white/60">
                  <span className="mt-0.5 flex-shrink-0 text-red-400">↓</span>
                  <span>{entry.whenLower}</span>
                </div>
              )}
            </div>
          )}

          {entry.learnSlug && (
            <Link
              href={`/learn/${entry.learnSlug}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
              onClick={() => setOpen(false)}
            >
              Learn more
              <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
                <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
