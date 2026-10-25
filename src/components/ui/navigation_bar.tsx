"use client";

import { tabbableWithin } from "@/app/utils/keyboard_select";
import { KeyboardEvent, ReactNode, useRef } from "react";
import { Stack, Tabs } from "@chakra-ui/react";
import { NavigationDrawer } from "./navigation_drawer";

export function NavigationBar(props: {
  defaultTab: string;
  tabTriggers: ReactNode;
  tabContents: ReactNode;
  actions?: ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}) {
  const {
    defaultTab,
    tabTriggers,
    tabContents,
    actions,
    activeTab,
    setActiveTab,
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Tabs.Root
        ref={rootRef}
        onKeyDown={(e) => handleTabKeyDown(e, rootRef.current)}
        defaultValue={defaultTab}
        value={activeTab && setActiveTab ? activeTab : undefined}
        onValueChange={
          activeTab && setActiveTab ? (e) => setActiveTab?.(e.value) : undefined
        }
        variant="line"
        // lazyMount
        fitted
      >
        <Stack
          direction={{ base: "column", md: "row" }}
          gapY={0}
          position="sticky"
          top={0}
          zIndex={999}
          bg={{ base: "white", _dark: "black" }}
          width="100%"
        >
          <NavigationDrawer />
          <Tabs.List>{tabTriggers}</Tabs.List>
          {actions}
        </Stack>
        {tabContents}
      </Tabs.Root>
    </>
  );
}

// The keyboard flow of the tabs:
// - Tab goes along the tabs. Only the selected tab is followed by its content: Tab on it goes in to
//   the content, and Tab past the end of the content goes to the next tab.
// - Shift+Tab is the exact reverse of that.
// - Enter on a tab selects it and goes in to its content (if it is selected already, just goes in).
// - Escape in the content goes back to the selected tab.
// - Left, Right, Home and End move between the tabs and select them, which the tabs do themselves.
// Merely tabbing past a tab does not select it.
function handleTabKeyDown(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root || e.defaultPrevented) return;
  if (!["Tab", "Enter", "Escape"].includes(e.key)) return;

  const target = e.target as HTMLElement;
  const triggers = Array.from(
    root.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)'),
  );
  const panel = root.querySelector<HTMLElement>(
    '[role="tabpanel"]:not([hidden])',
  );
  if (!panel || triggers.length === 0) return;

  const selectedIndex = triggers.findIndex(
    (trigger) => trigger.getAttribute("aria-selected") === "true",
  );
  const selected = triggers[selectedIndex];
  const content = tabbableWithin(panel);
  const go = (element?: HTMLElement) => {
    if (!element) return false;
    e.preventDefault();
    element.focus();
    return true;
  };

  if (e.key === "Escape") {
    if (panel.contains(target)) go(selected);
    return;
  }

  if (e.key === "Enter") {
    if (!triggers.includes(target)) return;
    if (target === selected) go(content[0]);
    else if (!e.repeat) selectAndEnter(e, target, root);
    else e.preventDefault();
    return;
  }

  const lastTab = triggers.at(-1);
  const firstInPage = tabbableWithin(document)[0];
  if (!e.shiftKey) {
    if (target === selected) go(content[0]);
    else if (content.length > 0 && target === content.at(-1))
      go(triggers[selectedIndex + 1]);
    // After the last tab, the page order would lead back in to the selected content. Wrap round.
    else if (target === lastTab && selected !== lastTab) go(firstInPage);
  } else if (content.length > 0 && target === content[0]) {
    go(selected);
  } else if (content.length > 0 && target === triggers[selectedIndex + 1]) {
    go(content.at(-1));
  } else if (target === firstInPage && selected !== lastTab) {
    go(lastTab);
  }
}

// Selects the tab and moves focus to the first control of its content, waiting for the content to
// show up in case it renders or loads after the tab is selected.
let latestMove = 0;
function selectAndEnter(
  e: KeyboardEvent,
  trigger: HTMLElement,
  root: HTMLElement,
) {
  e.preventDefault();
  trigger.click();
  const move = ++latestMove;
  let attempts = 0;
  const enter = () => {
    if (move !== latestMove) return;
    // Only the panel of the tab that was selected, so that it is not the previous tab's
    // panel before the selection has rendered.
    const panel =
      trigger.getAttribute("aria-selected") === "true"
        ? root.querySelector<HTMLElement>(
            `[role="tabpanel"][aria-labelledby="${trigger.id}"]:not([hidden])`,
          )
        : null;
    const control = panel && tabbableWithin(panel)[0];
    if (control) control.focus();
    else if (++attempts < 20 && document.activeElement === trigger)
      setTimeout(enter, 50);
  };
  setTimeout(enter, 0);
}
