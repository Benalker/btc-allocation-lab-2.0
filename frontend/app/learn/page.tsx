import Link from "next/link";
import { LEARN_INDEX } from "@/content/learnContent";

const ICONS: Record<string, string> = {
  volatility:    "📈",
  drawdown:      "📉",
  "var-es":      "🎯",
  markowitz:     "🔬",
  diversification: "🌐",
};

export default function LearnIndex() {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Education
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Knowledge Base
          </h1>
          <p className="mt-3 text-base text-white/50">
            Plain-language explanations of portfolio risk concepts.
            <br />
            <span className="text-xs text-white/30">
              For educational purposes only. Not financial advice.
            </span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {LEARN_INDEX.map((item) => (
            <Link
              key={item.slug}
              href={`/learn/${item.slug}`}
              className="group glass-card block p-6 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="mb-3 text-3xl">{ICONS[item.slug] ?? "📚"}</div>
              <h2 className="mb-1 text-lg font-semibold text-white group-hover:text-violet-200 transition-colors">
                {item.title}
              </h2>
              <p className="text-sm text-white/50">{item.subtitle}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-violet-400">
                Read more
                <svg className="h-3 w-3 translate-x-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
                  <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
