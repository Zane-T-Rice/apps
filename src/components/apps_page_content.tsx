"use client";

import { NavigationBar } from "@/components/ui/navigation_bar";
import {
  Box,
  Card,
  Grid,
  GridItem,
  LinkBox,
  LinkOverlay,
  Tabs,
} from "@chakra-ui/react";
import { HiHome } from "react-icons/hi";
import NextLink from "next/link";
import CheckPermissionsForContent from "@/app/utils/check_permissions_for_content";
import { FaChartPie, FaGhost, FaServer } from "react-icons/fa";
import { GiCompanionCube } from "react-icons/gi";

const iconSize = 250;

const apps = [
  {
    name: "Calories",
    description: `Daily calorie goal tracker.`,
    link: "/calories",
    icon: <FaChartPie size={iconSize} />,
    imageDescription: "Calories pie chart.",
    requiredPermissions: ["server-manager:admin"],
    requiresOneOfPermissions: [],
  },
  {
    name: "Server Manager Admin Console",
    description: "Server Manager Service Admin UI.",
    link: "/servers",
    icon: <FaGhost size={iconSize} />,
    imageDescription: "Servers.",
    requiredPermissions: ["server-manager:admin"],
    requiresOneOfPermissions: [],
  },
  {
    name: "My Servers",
    description: "Manage my servers.",
    link: "/myservers",
    icon: <FaServer size={iconSize} />,
    imageDescription: "Servers.",
    requiredPermissions: [],
    requiresOneOfPermissions: ["server-manager:admin", "server-manager:public"],
  },
  {
    name: "Gloomahaven Companion",
    description: "Tools for playing the board game Gloomhaven.",
    link: "/gloomhaven_companion",
    icon: <GiCompanionCube size={iconSize} />,
    imageDescription: "Gloomhaven Companion Cube.",
    requiredPermissions: [],
    requiresOneOfPermissions: ["gloomhaven-companion:admin", "gloomhaven-companion:public"],
  },
];

const tabTriggers = (
  <Tabs.Trigger value="apps">
    <HiHome />
    Apps
  </Tabs.Trigger>
);

const tabContents = (
  <Tabs.Content value="apps">
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
                    <Card.Title mt="2">{app.name}</Card.Title>
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
                  <NextLink href={app.link} />
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
