import { useEffect, useState, type RefObject } from "react";
import { resolveTacticalLayout, type TacticalLayout } from "./layout";

/**
 * Observes the Tactical Ops root size and stamps data-layout.
 * Does not touch combat state. Listener is bound once per mount.
 */
export function useTacticalLayout(ref: RefObject<HTMLElement | null>): TacticalLayout {
  const [layout, setLayout] = useState<TacticalLayout>("compact");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const apply = () => {
      const vv = window.visualViewport;
      const w = el.clientWidth || vv?.width || window.innerWidth;
      const h = el.clientHeight || vv?.height || window.innerHeight;
      const next = resolveTacticalLayout(w, h);
      el.setAttribute("data-layout", next);
      el.style.setProperty("--tops-w", `${Math.round(w)}px`);
      el.style.setProperty("--tops-h", `${Math.round(h)}px`);
      setLayout((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    apply();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("resize", schedule);
    vvListen(schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      vvUnlisten(schedule);
    };
  }, [ref]);

  return layout;
}

function vvListen(fn: () => void): void {
  try {
    window.visualViewport?.addEventListener("resize", fn);
  } catch {
    /* ignore */
  }
}

function vvUnlisten(fn: () => void): void {
  try {
    window.visualViewport?.removeEventListener("resize", fn);
  } catch {
    /* ignore */
  }
}
