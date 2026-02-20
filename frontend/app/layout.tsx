import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTC Allocation Lab 2.0",
  description: "Multi-asset portfolio optimization with Bitcoin constraints",
};

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.06] bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg">₿</span>
          <span className="text-sm font-semibold text-white/90">
            BTC Allocation Lab
          </span>
          <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">
            2.0
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {[
            { href: "/",        label: "Optimizer", icon: "⚡" },
            { href: "/learn",   label: "Learn",     icon: "📚" },
            { href: "/history", label: "History",   icon: "📊" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white/90"
            >
              <span className="text-xs">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        <p className="hidden text-[10px] text-white/20 lg:block">
          Educational only · Not financial advice
        </p>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* Background blobs — fixed, behind everything */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="blob blob-purple" />
          <div className="blob blob-blue" />
          <div className="blob blob-indigo" />
        </div>
        <Nav />
        <div className="pt-14">{children}</div>
      </body>
    </html>
  );
}
