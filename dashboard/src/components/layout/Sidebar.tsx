"use client";

import Link from "next/link";

import { APP, NAV_ITEMS } from "@/lib/constants";
import SidebarItem from "@/components/navigation/SidebarItem";

export default function Sidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <Link href="/dashboard" className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-emerald-600">
            {APP.NAME}
          </span>

          <span className="text-sm text-slate-500">{APP.DESCRIPTION}</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Restaurant</p>

          <p className="mt-1 text-sm text-slate-500">Connected</p>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            <span className="text-sm font-medium text-emerald-600">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
