import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const BOTTOM_GAP_PX = 16;
const HEADER_GAP_PX = 12;

/**
 * Scrolls with the page until the sidebar bottom reaches the viewport,
 * then sticks there. Short sidebars stick under the header; tall ones
 * stay fixed once their end is visible. Releases naturally when the
 * column ends (before footer).
 */
export function StickySidebarColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const header = document.getElementById("site-header");
      const headerOffset =
        (header?.getBoundingClientRect().height ?? 0) + HEADER_GAP_PX;
      const sidebarHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Short: stick under header. Tall: stick when bottom hits viewport.
      setTop(
        Math.min(headerOffset, viewportHeight - sidebarHeight - BOTTOM_GAP_PX),
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    const header = document.getElementById("site-header");
    if (header) observer.observe(header);

    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("sticky", className)}
      style={{ top }}
    >
      {children}
    </div>
  );
}
