import { useMemo } from "react";

type DateRangeValue = "7" | "30" | "90" | "all";

const rangeLabels: Record<DateRangeValue, string> = {
  "7": "Last 7 Days",
  "30": "Last 30 Days",
  "90": "Last 90 Days",
  "all": "All Time",
};

const rangeValues: DateRangeValue[] = ["7", "30", "90", "all"];

function getDateCutoff(days: string): Date | null {
  if (days === "all") return null;
  const d = new Date();
  d.setDate(d.getDate() - parseInt(days));
  d.setHours(0, 0, 0, 0);
  return d;
}

export type { DateRangeValue };
export { rangeLabels, rangeValues, getDateCutoff };

export function useDateRange(range: string) {
  const isAll = range === "all";
  const label = rangeLabels[range as DateRangeValue] || "Last 30 Days";

  const cutoff = useMemo(() => getDateCutoff(range), [range]);

  const filterByDate = <T extends { timestamp?: string; createdAt?: string; date?: string }>(
    items: T[]
  ): T[] => {
    if (!cutoff) return items;
    return items.filter((item) => {
      const ts = item.timestamp || item.createdAt || item.date;
      if (!ts) return true;
      return new Date(ts).getTime() >= cutoff.getTime();
    });
  };

  return { range, isAll, label, cutoff, filterByDate };
}
