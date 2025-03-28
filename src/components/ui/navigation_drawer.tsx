"use client";

import {
  CloseButton,
  Drawer,
  IconButton,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "./link";
import CheckPermissionsForContent from "@/app/utils/check_permissions_for_content";

export function NavigationDrawer() {
  return (
    <Drawer.Root placement="start">
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="main menu"
          bg="white"
          _hover={{ bg: "blackAlpha.400" }}
        >
          <GiHamburgerMenu color="black" />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Apps</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Stack direction="column">
                <CheckPermissionsForContent requiredPermissions={[]}>
                  <Link href="/" variant="button">
                    Home
                  </Link>
                </CheckPermissionsForContent>
                <CheckPermissionsForContent requiredPermissions={[]}>
                  <Link href="/calories" variant="button">
                    Calories
                  </Link>
                </CheckPermissionsForContent>
                <CheckPermissionsForContent
                  requiredPermissions={["read:servers"]}
                >
                  <Link href="/servers" variant="button">
                    Server Manager
                  </Link>
                </CheckPermissionsForContent>
              </Stack>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild justifyItems="center">
              <CloseButton size="sm" marginTop={2} />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
