import {
  CloseButton,
  Drawer,
  IconButton,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "../dynamic/link";

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
                <Link href="/" variant="button">
                  Home
                </Link>
                <Link href="/calories" variant="button">
                  Calories
                </Link>
              </Stack>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
