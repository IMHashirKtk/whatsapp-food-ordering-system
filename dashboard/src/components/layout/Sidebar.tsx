"use client";

import Link from "next/link";
import { Wifi, WifiOff } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants";
import SidebarItem from "@/components/navigation/SidebarItem";
import { FoodajiLogo } from "@/components/brand/FoodajiLogo";
import { useSocket } from "@/hooks/useSocket";

export default function Sidebar() {
  const { isConnected } = useSocket();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-[4.5rem] items-center border-b border-sidebar-border px-5">
        <Link href="/dashboard" aria-label="Foodaji dashboard home">
          <FoodajiLogo />
        </Link>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-3">
          <p className="text-sm font-semibold text-sidebar-foreground">
            Restaurant workspace
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
            {isConnected ? (
              <Wifi className="size-3.5 text-sidebar-status" aria-hidden="true" />
            ) : (
              <WifiOff className="size-3.5 text-destructive" aria-hidden="true" />
            )}
            <span>
              Realtime {isConnected ? "connected" : "offline"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
