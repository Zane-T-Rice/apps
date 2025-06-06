"use client";

import { useLocalStorage } from "@/app/utils/use_local_storage";
import { Item } from "./calories_page_content";
import { Center, HStack, Text } from "@chakra-ui/react";
import { CSSProperties, useEffect } from "react";
import { Button } from "../recipes/button";

export function QuickAddRemoveButton(props: {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (item: Item) => void;
  style?: CSSProperties | undefined;
}) {
  const { items, addItem, removeItem, style } = props;

  const [quickItems, setQuickItems] = useLocalStorage<Item[]>("quickItems", []);

  useEffect(() => {
    setQuickItems((prev) => {
      const quickItemsByName: { [key: string]: Item } = {};

      prev.forEach((e) => {
        quickItemsByName[e.name] = e;
      });

      items.forEach((e) => {
        quickItemsByName[e.name] = e;
      });

      return Object.values(quickItemsByName);
    });
  }, [items, setQuickItems]);

  const removeQuickItem = (item: Item) => {
    const index = quickItems.findIndex((e) => item.name === e.name);
    setQuickItems(quickItems.filter((e, i) => i !== index));
  };

  return quickItems.map((quickItem) => {
    return (
      <HStack
        key={quickItem.name}
        width="400px"
        mdDown={{ width: "100%", maxWidth: "420px" }}
        style={style}
      >
        <Center
          width="3/6"
          bgColor="black"
          rounded="xl"
          color="white"
          height="40px"
        >
          <Text
            colorPalette="green"
            rounded="xl"
            key={`${quickItem.name}-label`}
          >{`${quickItem.name} - ${quickItem.amount}`}</Text>
        </Center>
        <Button
          variant="safe"
          rounded="xl"
          key={`${quickItem.name}-add`}
          onClick={() => addItem(quickItem)}
          width="1/6"
        >{`+`}</Button>
        <Button
          variant="safe"
          rounded="xl"
          key={`${quickItem.name}-remove`}
          onClick={() => removeItem(quickItem)}
          width="1/6"
        >{`-`}</Button>
        <Button
          variant="unsafe"
          rounded="xl"
          key={`${quickItem.name}-remove-quick-item`}
          onClick={() => removeQuickItem(quickItem)}
          width="1/6"
          disabled={items.findIndex((e) => e.name === quickItem.name) !== -1}
        >{`X`}</Button>
      </HStack>
    );
  });
}
