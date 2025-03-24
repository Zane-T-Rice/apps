import { ReactNode } from "react";
import { Stack, Tabs } from "@chakra-ui/react";
import { NavigationDrawer } from "../static/navigation_drawer";

export function NavigationBar(props: {
  defaultTab: string;
  tabTriggers: ReactNode;
  tabContents: ReactNode;
  actions?: ReactNode;
}) {
  const { defaultTab, tabTriggers, tabContents, actions } = props;

  return (
    <Tabs.Root defaultValue={defaultTab} variant="line" lazyMount unmountOnExit>
      <Stack direction={{ base: "column", md: "row" }}>
        <NavigationDrawer />
        <Tabs.List marginEnd="auto">{tabTriggers}</Tabs.List>
        {actions}
      </Stack>
      {tabContents}
    </Tabs.Root>
  );
}
