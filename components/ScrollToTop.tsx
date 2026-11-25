"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/** Start every new page at the very top (instant, no smooth scroll), unless the URL targets a #section. */
export default function ScrollToTop() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
