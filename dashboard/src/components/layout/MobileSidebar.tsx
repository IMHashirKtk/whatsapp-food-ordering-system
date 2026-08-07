"use client";

import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import Link from "next/link";
import { Wifi, WifiOff, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { FoodajiLogo } from "@/components/brand/FoodajiLogo";
import SidebarItem from "@/components/navigation/SidebarItem";
import { NAV_ITEMS } from "@/lib/constants";
import { useSocket } from "@/hooks/useSocket";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileSidebar({
  open,
  onClose,
  triggerRef,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastPathnameRef = useRef(pathname);
  const focusedOnOpenRef = useRef(false);
  const wasOpenRef = useRef(false);
  const { isConnected } = useSocket();

  useEffect(() => {
    if (!open) {
      focusedOnOpenRef.current = false;
      lastPathnameRef.current = pathname;
      return;
    }

    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      onClose();
      return;
    }

    if (!focusedOnOpenRef.current) {
      focusedOnOpenRef.current = true;
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    }
  }, [onClose, open, pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [open, triggerRef]);

  const handleDrawerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) {
      event.preventDefault();
      drawerRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <aside
        ref={drawerRef}
        id="mobile-navigation"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        onKeyDown={handleDrawerKeyDown}
        className="relative flex h-full w-[min(20rem,calc(100vw-2.5rem))] flex-col bg-sidebar text-sidebar-foreground shadow-2xl focus:outline-none"
      >
        <header className="flex h-[4.5rem] items-center justify-between border-b border-sidebar-border px-5">
          <Link
            href="/dashboard"
            aria-label="Foodaji dashboard home"
            onClick={onClose}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <FoodajiLogo />
          </Link>
          <h2 id="mobile-navigation-title" className="sr-only">
            Mobile navigation
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close navigation"
            title="Close navigation"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <nav
          aria-label="Primary navigation"
          className="flex-1 space-y-1 p-4"
        >
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              onNavigate={onClose}
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
    </div>
  );
}
