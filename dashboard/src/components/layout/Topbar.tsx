"use client";

import { Bell, BellOff, Search } from "lucide-react";

import { useSocket } from "@/hooks/useSocket";

export default function Topbar() {
  const { isSoundMuted, toggleSoundMuted } = useSocket();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <p className="text-sm text-slate-500">
          Welcome back! Manage your restaurant.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 lg:flex">
          <Search className="h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          aria-label={isSoundMuted ? "Unmute order alerts" : "Mute order alerts"}
          aria-pressed={isSoundMuted}
          title={isSoundMuted ? "Unmute order alerts" : "Mute order alerts"}
          onClick={toggleSoundMuted}
          className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100"
        >
          {isSoundMuted ? (
            <BellOff className="h-5 w-5 text-slate-600" />
          ) : (
            <Bell className="h-5 w-5 text-slate-600" />
          )}
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
            F
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-900">Foodaji Demo</p>

            <p className="text-xs text-slate-500">Restaurant Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
