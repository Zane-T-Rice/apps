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
import { Button } from "../recipes/button";
import { useAuth0 } from "@auth0/auth0-react";
import { ColorModeButton } from "./color-mode";

export function NavigationDrawer() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  return (
    <Drawer.Root placement="start">
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="main menu"
          bg={{ base: "white", _dark: "black" }}
          color={{ base: "black", _dark: "white" }}
          _hover={{ bg: { base: "blackAlpha.400", _dark: "whiteAlpha.400" } }}
        >
          <GiHamburgerMenu />
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
                <CheckPermissionsForContent
                  requiredPermissions={["server-manager:admin"]}
                >
                  <Link href="/calories" variant="button">
                    Calories
                  </Link>
                </CheckPermissionsForContent>
                <CheckPermissionsForContent
                  requiredPermissions={[]}
                  requiresOneOfPermissions={["server-manager:admin", "server-manager:public"]}
                >
                  <Link href="/myservers" variant="button">
                    My Servers
                  </Link>
                </CheckPermissionsForContent>
                <CheckPermissionsForContent
                  requiredPermissions={["server-manager:admin"]}
                >
                  <Link href="/servers" variant="button">
                    Server Manager
                  </Link>
                </CheckPermissionsForContent>
                <ColorModeButton />
              </Stack>
            </Drawer.Body>
            <Drawer.Footer>
              {!isLoading && isAuthenticated ? (
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
              ) : null}
              {!isLoading && !isAuthenticated ? (
                <Button variant="safe" onClick={() => loginWithRedirect()}>
                  Login
                </Button>
              ) : null}
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild justifyItems="center">
              <CloseButton size="sm" marginTop={2} />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
