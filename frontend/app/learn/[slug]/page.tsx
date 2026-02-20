"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LEARN_CONTENT } from "@/content/learnContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function LearnDetail({ params }: Props) {
  const { slug } = use(params);
  const content = LEARN_CONTENT[slug];
  if (!content) notFound();

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-14">
        {/* Back */}
        <Link
          href="/learn"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
            <path d="M10 6H2M6 2L2 6l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Knowledge Base
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Learn
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-2 text-base text-white/50">{content.subtitle}</p>
        </div>

        {/* Intro */}
        <p className="mb-8 text-base leading-relaxed text-white/70">
          {content.intro}
        </p>

        {/* Sections */}
        <div className="space-y-6 mb-10">
          {content.sections.map((s) => (
            <div key={s.heading} className="glass-card p-6">
              <h2 className="mb-3 text-base font-semibold text-white">{s.heading}</h2>
              <p className="text-sm leading-relaxed text-white/65">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="glass-card mb-10 p-6">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Illustration
          </h2>
          {content.chart}
          <p className="mt-3 text-center text-xs text-white/40 italic">
            {content.chartCaption}
          </p>
        </div>

        {/* Key takeaways */}
        <div className="glass-card p-6 mb-10">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Key Takeaways
          </h2>
          <ul className="space-y-3">
            {content.keyTakeaways.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-0.5 flex-shrink-0 text-violet-400">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-white/25 mb-8">
          Educational content only. All data is simulated or illustrative.
          Not financial advice.
        </p>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Try the Optimizer →
          </Link>
        </div>
      </div>
    </main>
  );
}
