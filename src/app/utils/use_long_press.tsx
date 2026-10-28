import {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// How long to hold before it counts as a long press.
export const LONG_PRESS_MS = 500;

// Props to spread on a button so that holding it runs onLongPress. Letting go of a long press
// should not also count as a tap, so a click handler asks wasLongPress first.
export function useLongPress(
  onLongPress: (target: HTMLElement) => void,
  {
    ms = LONG_PRESS_MS,
    // What a long press is from the keyboard. "shift" is shift with enter or space, for buttons
    // with no other keyboard way. "hold" is holding enter or space down like a finger, which
    // means enter and space no longer click the button. False leaves the keyboard alone.
    keyboard = "shift",
  }: { ms?: number; keyboard?: "shift" | "hold" | false } = {},
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef<boolean>(false);
  const latest = useRef(onLongPress);
  const [pressing, setPressing] = useState<boolean>(false);

  useEffect(() => {
    latest.current = onLongPress;
  });

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPressing(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  // True once for a click that is only the end of a long press.
  const wasLongPress = useCallback(() => {
    const was = fired.current;
    fired.current = false;
    return was;
  }, []);

  const start = (target: HTMLElement) => {
    fired.current = false;
    cancel();
    setPressing(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      fired.current = true;
      setPressing(false);
      latest.current(target);
    }, ms);
  };

  const isActivationKey = (e: KeyboardEvent<HTMLElement>) =>
    e.key === "Enter" || e.key === " ";

  const longPressProps = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => start(e.currentTarget),
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // Holding a finger down would otherwise open the phone's menu or select the icon.
    onContextMenu: (e: MouseEvent<HTMLElement>) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      fired.current = false;
      if (!isActivationKey(e)) return;
      // Holding a key repeats it, which would repeat whatever the button does.
      if (e.repeat) {
        e.preventDefault();
        return;
      }
      if (keyboard === "shift" && e.shiftKey) {
        e.preventDefault();
        latest.current(e.currentTarget);
      } else if (keyboard === "hold") {
        e.preventDefault();
        start(e.currentTarget);
      }
    },
    onKeyUp: (e: KeyboardEvent<HTMLElement>) => {
      if (keyboard !== "hold" || !isActivationKey(e)) return;
      // Space would otherwise click the button as it is let go.
      e.preventDefault();
      cancel();
    },
    // Moving away part way through a hold ends it.
    onBlur: cancel,
    userSelect: "none" as const,
    style: { WebkitTouchCallout: "none" } as CSSProperties,
  };

  return { pressing, wasLongPress, longPressProps };
}
