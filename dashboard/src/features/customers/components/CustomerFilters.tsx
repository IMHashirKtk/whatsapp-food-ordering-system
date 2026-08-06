"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CustomerFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function CustomerFilters({
  searchValue,
  onSearchChange,
}: CustomerFiltersProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="customer-search"
        className="text-sm font-medium text-slate-700"
      >
        Search customers
      </label>
      <div className="relative mt-2 max-w-xl">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id="customer-search"
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Name, WhatsApp number, or email"
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
        />
        {searchValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Clear customer search"
            title="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => onSearchChange("")}
          >
            <X />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
