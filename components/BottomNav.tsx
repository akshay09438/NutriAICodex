"use client";

import Link from "next/link";

type Tab = "home" | "ate" | "smart" | "profile";

const items: Array<{
  key: Tab;
  label: string;
  href?: string;
}> = [
  { key: "home", label: "home", href: "/home" },
  { key: "ate", label: "i ate", href: "/log-meal" },
  { key: "smart", label: "smart", href: "/smart" },
  { key: "profile", label: "profile" },
];

export default function BottomNav({
  active,
  onToast,
}: {
  active: Tab;
  onToast?: (text: string) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white/95 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto grid max-w-[420px] grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = active === item.key;
          const baseClass = `flex min-h-[58px] items-center justify-center rounded-2xl border px-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] leading-[1.15] transition whitespace-normal break-words ${
            isActive
              ? "border-black bg-black text-white"
              : "border-[#D4D4D8] bg-white text-black"
          }`;

          if (item.href) {
            return (
              <Link key={item.key} href={item.href} className={baseClass}>
                {item.label}
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              className={baseClass}
              onClick={() => onToast?.("Profile coming soon")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
