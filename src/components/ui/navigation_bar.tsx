"use client";

import { ReactNode } from "react";
import { Stack, Tabs } from "@chakra-ui/react";
import { NavigationDrawer } from "./navigation_drawer";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../recipes/button";

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

  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  return (
    <>
      {!isLoading && isAuthenticated ? (
        <Tabs.Root
          defaultValue={defaultTab}
          value={activeTab && setActiveTab ? activeTab : undefined}
          onValueChange={
            activeTab && setActiveTab
              ? (e) => setActiveTab?.(e.value)
              : undefined
          }
          variant="line"
          lazyMount
          unmountOnExit
        >
          <Stack direction={{ base: "column", md: "row" }}>
            <NavigationDrawer />
            <Tabs.List flex="auto">{tabTriggers}</Tabs.List>
            {actions}
            <Button
              variant="safe"
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: `${process.env.NEXT_PUBLIC_WEBSITE_DOMAIN}/apps`,
                  },
                })
              }
            >
              Logout
            </Button>
          </Stack>
          {tabContents}
        </Tabs.Root>
      ) : null}
      {!isLoading && !isAuthenticated ? (
        <Button width="100%" variant="safe" onClick={() => loginWithRedirect()}>
          Login
        </Button>
      ) : null}
    </>
  );
}
