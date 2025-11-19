"use client";

import { ReactNode } from "react";
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

  return (
    <>
      <Tabs.Root
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
