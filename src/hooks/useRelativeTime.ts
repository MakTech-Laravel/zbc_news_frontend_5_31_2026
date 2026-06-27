import { useEffect, useMemo, useState } from "react";

import {
  formatRelativeTime,
  getRelativeTimeUpdateInterval,
} from "@/lib/relativeTime";

export function useRelativeTime(value: string | null | undefined): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!value) return;

    const intervalMs = getRelativeTimeUpdateInterval(value);
    if (!intervalMs) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [value]);

  return useMemo(() => formatRelativeTime(value, new Date(now)), [value, now]);
}
