"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { RefObject } from "react";

import { useSocket } from "@/hooks/useSocket";
import { NAV_ITEMS } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";

interface TopbarProps {
  mobileNavOpen: boolean;
  onMobileNavOpen: () => void;
  mobileNavTriggerRef: RefObject<HTMLButtonElement | null>;
}

function formatRole(role?: string) {
  if (!role) {
    return "Team member";
  }

  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return initials || "R";
}

export default function Topbar({
  mobileNavOpen,
  onMobileNavOpen,
  mobileNavTriggerRef,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isSoundMuted, toggleSoundMuted } = useSocket();
  const currentNavItem = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)),
  );
  const pageTitle = currentNavItem?.title ?? "Dashboard";
  const userName = user?.name?.trim() || "Restaurant user";
  const userRole = formatRole(user?.role);

  const handleLogout = () => {
    queryClient.clear();
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-[4.5rem] items-center justify-between border-b border-border bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          ref={mobileNavTriggerRef}
          type="button"
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          aria-expanded={mobileNavOpen}
          title="Open navigation"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          onClick={onMobileNavOpen}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {pageTitle}
          </h1>
          <p className="hidden truncate text-sm text-muted-foreground sm:block">
            Restaurant operations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label={isSoundMuted ? "Unmute order alerts" : "Mute order alerts"}
          aria-pressed={isSoundMuted}
          title={isSoundMuted ? "Unmute order alerts" : "Mute order alerts"}
          onClick={toggleSoundMuted}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isSoundMuted ? (
            <BellOff className="size-5" aria-hidden="true" />
          ) : (
            <Bell className="size-5" aria-hidden="true" />
          )}
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 sm:gap-3 sm:px-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            {getInitials(userName)}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-foreground">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={handleLogout}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
