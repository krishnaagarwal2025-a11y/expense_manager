"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, ListOrdered, Plus, Split } from "lucide-react";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) return null;

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: ListOrdered, label: "Logs", href: "/expenses" },
    ...(user === "nitin" ? [{ icon: Split, label: "Split", href: "/allocate" }] : []),
    { icon: CreditCard, label: "Settle", href: "/settle" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(27,79,114,0.08)] backdrop-blur md:hidden">
      <div
        className="mx-auto grid max-w-md items-end gap-1"
        style={{ gridTemplateColumns: `repeat(${navItems.length + 1}, minmax(0, 1fr))` }}
      >
        {navItems.slice(0, 2).map((item) => (
          <MobileNavLink key={item.href} {...item} active={pathname === item.href} />
        ))}
        <Link
          href="/expenses"
          className="mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 active:scale-95"
          aria-label="Add expense"
        >
          <Plus className="h-6 w-6" />
        </Link>
        {navItems.slice(2).map((item) => (
          <MobileNavLink key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function MobileNavLink({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}
