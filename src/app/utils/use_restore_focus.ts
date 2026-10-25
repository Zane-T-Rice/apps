import { useCallback, useLayoutEffect, useRef } from "react";
import { nextUsableControl } from "./keyboard_select";

// For drawers and dialogs that give the focus back when they close. Remembers what had the focus
// when it opened and gives it back as the `finalFocusEl`. When that can not take the focus any
// more, i.e. the button was disabled by what the dialog did, the next usable control gets it.
export function useRestoreFocus(isOpen: boolean) {
  const opener = useRef<HTMLElement | null>(null);

  // Runs before the drawer moves the focus in to itself.
  useLayoutEffect(() => {
    if (isOpen) opener.current = document.activeElement as HTMLElement | null;
  }, [isOpen]);

  return useCallback(() => {
    const element = opener.current;
    if (!element?.isConnected) return null;
    return element.matches(":disabled")
      ? (nextUsableControl(element) ?? null)
      : element;
  }, []);
}
