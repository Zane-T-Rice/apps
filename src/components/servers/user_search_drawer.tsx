"use client";

import {
  CloseButton,
  Drawer,
  DrawerOpenChangeDetails,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Auth0User } from "@/app/utils/server-manager-service/server_manager_service_auth0_users";
import { Button } from "../recipes/button";

const SEARCH_DEBOUNCE_MS = 300;
// Must match the number of users the service returns per page when listing all.
const ALL_USERS_PAGE_SIZE = 50;

const matches = (user: Auth0User, text: string) =>
  [user.email, user.applicationName, user.userId].some((value) =>
    value?.toLowerCase().includes(text.toLowerCase()),
  );

// Lets an admin search auth0 users (by email) and machine-to-machine
// applications (by name). Emails are not always predictable, so the admin can
// also list everyone and narrow the list down by hand. The same email can
// belong to several auth0 users, so both the email and the auth0 user id are
// shown and the selected user is identified by its auth0 user id.
export function UserSearchDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  search: (query: Record<string, string>) => Promise<Auth0User[] | null>;
  onSelect: (user: Auth0User) => Promise<boolean>;
}) {
  const { isOpen, setIsOpen, search, onSelect } = props;

  const [searchText, setSearchText] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [results, setResults] = useState<Auth0User[]>([]);
  const [nextPage, setNextPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  // Targeted search: matches on the text the admin types.
  useEffect(() => {
    if (!isOpen || showAll) return;

    const trimmed = searchText.trim();
    let cancelled = false;
    const timeout = setTimeout(
      async () => {
        if (!trimmed) {
          setResults([]);
          return;
        }
        setIsSearching(true);
        const found = await search({ search: trimmed });
        if (cancelled) return;
        setResults(found ?? []);
        setIsSearching(false);
      },
      trimmed ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isOpen, showAll, searchText, search]);

  // Show all: load the first page of everyone. The text box then filters
  // what has been loaded.
  useEffect(() => {
    if (!isOpen || !showAll) return;

    let cancelled = false;
    (async () => {
      setIsSearching(true);
      const found = await search({ all: "true", page: "0" });
      if (cancelled) return;
      setResults(found ?? []);
      setNextPage(1);
      setHasMore(
        (found ?? []).filter((user) => user.type === "user").length >=
          ALL_USERS_PAGE_SIZE,
      );
      setIsSearching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, showAll, search]);

  const loadMore = async () => {
    setIsSearching(true);
    const found = (await search({ all: "true", page: String(nextPage) })) ?? [];
    setResults((prev) => [...prev, ...found]);
    setNextPage((prev) => prev + 1);
    setHasMore(found.length >= ALL_USERS_PAGE_SIZE);
    setIsSearching(false);
  };

  const close = () => {
    setIsOpen(false);
    setSearchText("");
    setShowAll(false);
    setResults([]);
    setHasMore(false);
  };

  const select = async (user: Auth0User) => {
    if (isSelecting) return;
    setIsSelecting(true);
    if (await onSelect(user)) close();
    setIsSelecting(false);
  };

  const toggleShowAll = () => {
    setResults([]);
    setHasMore(false);
    setShowAll((prev) => !prev);
  };

  const visibleResults =
    showAll && searchText.trim()
      ? results.filter((user) => matches(user, searchText.trim()))
      : results;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(details: DrawerOpenChangeDetails) => {
        if (details.open) setIsOpen(true);
        else close();
      }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Add User</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Stack direction="column" gap={3}>
                <Input
                  placeholder={
                    showAll
                      ? "Filter the loaded users"
                      : "Part of an email, or a machine name"
                  }
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  autoFocus
                />
                <Button variant="outline" onClick={toggleShowAll}>
                  {showAll ? "Back to search" : "Show all users"}
                </Button>
                {visibleResults.map((user) => (
                  <Stack
                    key={user.userId}
                    direction="column"
                    gap={0}
                    padding={2}
                    borderWidth={1}
                    borderRadius="md"
                    cursor="pointer"
                    opacity={isSelecting ? 0.5 : 1}
                    _hover={{ bg: "blackAlpha.500" }}
                    onClick={() => select(user)}
                  >
                    <Text truncate>
                      {user.email ?? user.applicationName ?? user.userId}
                      {user.type === "machine" ? " (machine)" : ""}
                    </Text>
                    <Text fontSize="xs" opacity={0.7} truncate>
                      {user.userId}
                    </Text>
                  </Stack>
                ))}
                {showAll && hasMore ? (
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isSearching}
                  >
                    {isSearching ? "Loading..." : "Load more"}
                  </Button>
                ) : null}
                {!isSearching &&
                visibleResults.length === 0 &&
                (showAll || searchText.trim()) ? (
                  <Text opacity={0.7}>No users found.</Text>
                ) : null}
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
