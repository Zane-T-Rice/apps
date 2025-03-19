"use client";

import {
  Box,
  Button,
  CloseButton,
  Drawer,
  HStack,
  Input,
  Portal,
} from "@chakra-ui/react";
import { GrClear } from "react-icons/gr";
import { Item } from "./calories_page_content";
import { FaPlus } from "react-icons/fa";
import { useSessionStorage } from "@/app/utils/use_session_storage";

export default function AddItemButtonGroup(props: {
  clearItems: () => void;
  addItem: (item: Item) => void;
  items: Item[];
}) {
  const { clearItems, addItem, items } = props;
  const [name, setName] = useSessionStorage("name", "");
  const [calories, setCalories] = useSessionStorage("calories", "");

  return (
    <Box>
      <HStack>
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <Button variant="solid" colorPalette="green" rounded="xl">
              <FaPlus /> Add Item
            </Button>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Add Item</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <Input
                    placeholder="Name"
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                  />
                  <Input
                    placeholder="Calories"
                    onChange={(event) => setCalories(event.target.value)}
                    value={calories}
                  />
                </Drawer.Body>
                <Drawer.Context>
                  {(store) => (
                    <Drawer.Footer>
                      <Button
                        variant="outline"
                        onClick={() => {
                          store.setOpen(false);
                          setName("");
                          setCalories("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          addItem({ name, amount: parseInt(calories) });
                          store.setOpen(false);
                          setName("");
                          setCalories("");
                        }}
                      >
                        Save
                      </Button>
                    </Drawer.Footer>
                  )}
                </Drawer.Context>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
        {items && items.length > 0 ? (
          <Button
            variant="solid"
            colorPalette="green"
            rounded="xl"
            onClick={() => {
              clearItems();
            }}
          >
            <GrClear /> Clear Items
          </Button>
        ) : null}
      </HStack>
    </Box>
  );
}
