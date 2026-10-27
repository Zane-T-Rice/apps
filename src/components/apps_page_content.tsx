"use client";

import { NavigationBar } from "@/components/ui/navigation_bar";
import {
  Box,
  Card,
  Flex,
  Grid,
  GridItem,
  LinkBox,
  LinkOverlay,
  Tabs,
} from "@chakra-ui/react";
import { HiHome } from "react-icons/hi";
import NextLink from "next/link";
import { spaceActivatesLinkProps } from "@/app/utils/keyboard_select";
import CheckPermissionsForContent from "@/app/utils/check_permissions_for_content";
import { FaGhost, FaServer } from "react-icons/fa";
import { GiCompanionCube } from "react-icons/gi";
import { StatusLight } from "@/components/ui/status_light";
import { useAppHealth } from "@/app/utils/use_app_health";

const iconSize = 250;

const serverManagerHealthUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/health`;
const gloomhavenHealthUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/health`;

// Whether the service behind an app is up. Click it to ask again.
function AppHealthLight(props: { healthUrl: string }) {
  const { health, refresh } = useAppHealth(props.healthUrl);
  return (
    // Above the card's link, which would otherwise take the click.
    <Box position="relative" zIndex={1}>
      <StatusLight
        status={health}
        onRefresh={refresh}
        isRefreshing={health === "checking"}
      />
    </Box>
  );
}

const apps = [
  {
    name: "Server Manager Admin Console",
    description: "Server Manager Service Admin UI.",
    healthUrl: serverManagerHealthUrl,
    link: "/servers",
    icon: <FaGhost size={iconSize} />,
    imageDescription: "Servers.",
    requiredPermissions: ["server-manager:admin"],
    requiresOneOfPermissions: [],
  },
  {
    name: "My Servers",
    description: "Manage my servers.",
    healthUrl: serverManagerHealthUrl,
    link: "/myservers",
    icon: <FaServer size={iconSize} />,
    imageDescription: "Servers.",
    requiredPermissions: [],
    requiresOneOfPermissions: ["server-manager:admin", "server-manager:public"],
  },
  {
    name: "Gloomahaven Companion",
    description: "Tools for playing the board game Gloomhaven.",
    healthUrl: gloomhavenHealthUrl,
    link: "/gloomhaven_companion",
    icon: <GiCompanionCube size={iconSize} />,
    imageDescription: "Gloomhaven Companion Cube.",
    requiredPermissions: [],
    requiresOneOfPermissions: [
      "gloomhaven-companion:admin",
      "gloomhaven-companion:public",
    ],
  },
];

const tabTriggers = (
  <Tabs.Trigger tabIndex={0} value="apps">
    <HiHome />
    Apps
  </Tabs.Trigger>
);

const tabContents = (
  <Tabs.Content tabIndex={-1} value="apps">
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      }}
      gap="0"
    >
      {apps.map((app, index) => {
        return (
          <CheckPermissionsForContent
            key={`check-permissions-${index}`}
            requiredPermissions={app.requiredPermissions}
            requiresOneOfPermissions={app.requiresOneOfPermissions}
          >
            <GridItem
              colSpan={1}
              key={`navigation-bar-grid-item-${index}`}
              justifyItems="center"
            >
              <Card.Root
                variant="elevated"
                width="95%"
                height="95%"
                key={`navigation-bar-${index}`}
                _hover={{
                  bg: { base: "blackAlpha.400", _dark: "whiteAlpha.400" },
                }}
                _focusWithin={{
                  bg: { base: "blackAlpha.400", _dark: "whiteAlpha.400" },
                }}
              >
                <LinkBox>
                  <Card.Body gap="2">
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      gap={2}
                    >
                      <Card.Title mt="2">{app.name}</Card.Title>
                      <AppHealthLight healthUrl={app.healthUrl} />
                    </Flex>
                    <Box justifyItems="center">{app.icon}</Box>
                    <Card.Description
                      fontSize={18}
                      truncate
                      width="100%"
                      textAlign="center"
                    >
                      {app.description}
                    </Card.Description>
                  </Card.Body>
                </LinkBox>
                <LinkOverlay asChild>
                  <NextLink href={app.link} {...spaceActivatesLinkProps} />
                </LinkOverlay>
              </Card.Root>
            </GridItem>
          </CheckPermissionsForContent>
        );
      })}
    </Grid>
  </Tabs.Content>
);

export default function AppsPageContent() {
  return (
    <NavigationBar
      tabTriggers={tabTriggers}
      tabContents={tabContents}
      defaultTab="apps"
    />
  );
}
