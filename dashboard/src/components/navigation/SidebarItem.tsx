"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export default function SidebarItem({
  title,
  href,
  icon: Icon,
}: SidebarItemProps) {
  const pathname = usePathname();

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </Link>
  );
}
