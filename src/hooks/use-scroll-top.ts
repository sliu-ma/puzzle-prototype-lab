import { useEffect, useRef } from "react";

/**
 * Scrolls window to top when the tracked value changes (skips first render).
 */
export function useScrollToTopOnChange(value: unknown) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [value]);
}
