"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  title: string;
  href: string;
  icon: LucideIcon;
  onNavigate?: () => void;
};

export default function SidebarItem({
  title,
  href,
  icon: Icon,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();

  const isActive =
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={`flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-4 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
        isActive
          ? "border-primary bg-sidebar-accent text-sidebar-foreground"
          : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${isActive ? "text-primary" : "text-sidebar-foreground/60"}`}
        aria-hidden="true"
      />
      <span>{title}</span>
    </Link>
  );
}
