import { KeyboardEvent } from "react";

// Props that make a clickable container a keyboard tab stop that selects on
// Enter or Space. Keys pressed inside nested controls (buttons, inputs) are ignored.
export function keyboardSelectProps(onSelect: () => void) {
  return {
    tabIndex: 0,
    "data-keyboard-select": "",
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
  };
}

const TABBABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Toasts are left out: they are focusable, but they are not part of the page flow and focus
// should not be sent to one.
export const tabbableWithin = (container: ParentNode) =>
  Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) =>
      !element.matches(":disabled") &&
      !element.closest('[data-scope="toast"]') &&
      element.getAttribute("tabindex") !== "-1" &&
      element.getClientRects().length > 0,
  );

// Runs a removal from a button inside a keyboard selectable item, then moves focus to what comes
// next in the tab order, as if tabbing on from the end of the removed item: the next item, the
// next group's first control or, when nothing follows, the next tab. The removed item takes the
// focus with it and the list may be rendered again after the removal, so the target is found by
// its position in the tab order instead of by keeping the element.
export async function removeAndRefocus(
  button: HTMLElement,
  remove: () => Promise<unknown>,
) {
  const item = button.closest<HTMLElement>("[data-keyboard-select]");
  if (!item) return;

  const before = tabbableWithin(document);
  const removedCount = before.filter((element) =>
    item.contains(element),
  ).length;
  const firstAfter = before.findIndex(
    (element) =>
      !item.contains(element) &&
      item.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const targetIndex =
    (firstAfter === -1 ? before.length : firstAfter) - removedCount;
  const nextTab = nextTabOf(item);

  if ((await remove()) === false) return;

  const focusNext = () => {
    const after = tabbableWithin(document);
    (after[targetIndex] ?? nextTab ?? after.at(-1))?.focus();
  };
  // Wait for the removal to render, and check again in case it was rendered again afterwards.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      focusNext();
      setTimeout(() => {
        if (document.activeElement === document.body) focusNext();
      }, 150);
    }),
  );
}

// The tab after the one whose panel the element is in.
function nextTabOf(element: HTMLElement) {
  const panel = element.closest("[role=tabpanel]");
  const trigger =
    panel &&
    document.getElementById(panel.getAttribute("aria-labelledby") ?? "");
  if (!trigger) return undefined;
  const triggers = tabbableWithin(trigger.parentElement ?? document).filter(
    (candidate) => candidate.getAttribute("role") === "tab",
  );
  return triggers[triggers.indexOf(trigger) + 1];
}

// Keeps the keyboard focus usable. A button that has the focus when it becomes disabled (i.e.
// Delete once the deleted row is no longer selected) can no longer be used, and focus is left on
// nothing. Move the focus on to the next control in the tab order, or the previous one if it was
// the last.
export function keepFocusUsable() {
  let focused: HTMLElement | null = null;
  const onFocusIn = (e: FocusEvent) => {
    focused = e.target as HTMLElement;
  };

  let timeout: ReturnType<typeof setTimeout> | undefined;
  const check = () => {
    const element = focused;
    if (!element?.isConnected || !element.matches(":disabled")) return;
    const active = document.activeElement;
    if (active !== element && active !== document.body) return;

    nextUsableControl(element)?.focus();
  };
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    // Give it a moment, in case the control is only disabled while something is going on.
    timeout = setTimeout(check, 50);
  });

  document.addEventListener("focusin", onFocusIn);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["disabled"],
    subtree: true,
  });
  return () => {
    document.removeEventListener("focusin", onFocusIn);
    observer.disconnect();
    clearTimeout(timeout);
  };
}

// Where the focus should go instead of an element that can not have it (i.e. it is disabled): the
// next control in the same tab's content, otherwise the next tab, as when tabbing on from it.
export function nextUsableControl(element: HTMLElement) {
  const panel = element.closest("[role=tabpanel]") ?? document;
  return (
    tabbableWithin(panel).find(
      (control) =>
        element.compareDocumentPosition(control) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ) ??
    nextTabOf(element) ??
    // Nothing comes after it: stay in the content on the control before it, so that tabbing on
    // leaves the page just like it does from there.
    tabbableWithin(panel)
      .filter(
        (control) =>
          element.compareDocumentPosition(control) &
          Node.DOCUMENT_POSITION_PRECEDING,
      )
      .at(-1) ??
    tabbableWithin(document).at(-1)
  );
}

// Props for a link, so that Space activates it like Enter does, as it does for a button.
export const spaceActivatesLinkProps = {
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
    // Stops Space from scrolling the page.
    if (e.key === " ") e.preventDefault();
  },
  onKeyUp: (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === " ") e.currentTarget.click();
  },
};
