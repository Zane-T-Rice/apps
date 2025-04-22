"use client";

import { NavigationBar } from "@/components/ui/navigation_bar";
import {
  Box,
  Card,
  Grid,
  GridItem,
  Image,
  LinkBox,
  LinkOverlay,
  Tabs,
} from "@chakra-ui/react";
import { HiHome } from "react-icons/hi";
import NextImage from "next/image";
import NextLink from "next/link";
import CheckPermissionsForContent from "@/app/utils/check_permissions_for_content";

const apps = [
  {
    name: "Calories",
    description: `Daily calorie goal tracker.`,
    link: "/calories",
    image: "/apps/calories_chart.png",
    imageDescription: "Calories pie chart.",
    requiredPermissions: [],
  },
  {
    name: "Server Manager",
    description: "Server Manager Service UI.",
    link: "/servers",
    image: "/apps/servers.png",
    imageDescription: "Servers.",
    requiredPermissions: ["read:servers"],
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
                    <Box justifyItems="center">
                      <Image asChild alt={app.imageDescription}>
                        <NextImage
                          src={app.image}
                          alt={app.imageDescription}
                          priority
                          width={250}
                          height={250}
                          style={{ width: 250, height: 250 }}
                        />
                      </Image>
                    </Box>
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
