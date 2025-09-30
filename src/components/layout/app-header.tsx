"use client";

import { UserNav } from "@/components/layout/user-nav";
import { Flame } from "lucide-react";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="size-6 text-primary" />
          <span className="text-lg font-semibold">StreakSphere</span>
        </div>
        <UserNav />
      </div>
    </header>
  );
}
