"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type {
  AnalyticsDatePreset,
  AnalyticsFilterState,
  AnalyticsGroupBy,
} from "../types";
import {
  getPresetRange,
  getSuggestedGroupBy,
} from "../utils/analyticsFormatters";

interface AnalyticsFiltersProps {
  timezone: string;
  value: AnalyticsFilterState;
  onApply: (value: AnalyticsFilterState) => void;
}

const presets: Array<{ value: AnalyticsDatePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

const groupingOptions: Array<{ value: AnalyticsGroupBy; label: string }> = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export default function AnalyticsFilters({
  timezone,
  value,
  onApply,
}: AnalyticsFiltersProps) {
  const [preset, setPreset] = useState(value.preset);
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const [groupBy, setGroupBy] = useState(value.groupBy);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreset(value.preset);
    setFrom(value.from);
    setTo(value.to);
    setGroupBy(value.groupBy);
    setError(null);
  }, [value]);

  const handlePresetChange = (nextPreset: AnalyticsDatePreset) => {
    setPreset(nextPreset);
    setError(null);

    if (nextPreset !== "custom") {
      const range = getPresetRange(nextPreset, timezone);
      setFrom(range.from);
      setTo(range.to);
      setGroupBy(getSuggestedGroupBy(nextPreset));
    } else {
      setGroupBy(getSuggestedGroupBy(nextPreset, from, to));
    }
  };

  const handleApply = () => {
    if (!from || !to) {
      setError("Choose both a start and end date.");
      return;
    }

    if (from > to) {
      setError("The start date must be before the end date.");
      return;
    }

    const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
    const [toYear, toMonth, toDay] = to.split("-").map(Number);
    const days = Math.round(
      (Date.UTC(toYear, toMonth - 1, toDay) -
        Date.UTC(fromYear, fromMonth - 1, fromDay)) /
        86400000,
    ) + 1;

    if (days > 366) {
      setError("Analytics ranges cannot exceed 366 days.");
      return;
    }

    setError(null);
    onApply({ preset, from, to, groupBy });
  };

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-foreground">Date range</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={preset === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,150px)_minmax(0,150px)_auto]">
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => {
                const nextFrom = event.target.value;
                setPreset("custom");
                setFrom(nextFrom);
                setGroupBy(getSuggestedGroupBy("custom", nextFrom, to));
                setError(null);
              }}
              className="h-9 min-w-0 rounded-md border border-input bg-muted/50 px-3 text-sm font-normal text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => {
                const nextTo = event.target.value;
                setPreset("custom");
                setTo(nextTo);
                setGroupBy(getSuggestedGroupBy("custom", from, nextTo));
                setError(null);
              }}
              className="h-9 min-w-0 rounded-md border border-input bg-muted/50 px-3 text-sm font-normal text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
            />
          </label>
          <Button type="button" className="self-end" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Group by
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value as AnalyticsGroupBy)}
            className="h-9 rounded-md border border-input bg-muted/50 px-3 text-sm font-normal text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
          >
            {groupingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-muted-foreground">Dates use {timezone} restaurant time.</p>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </section>
  );
}
