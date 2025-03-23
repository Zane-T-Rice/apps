import { useLocalStorage } from "@/app/utils/use_local_storage";
import { Item } from "../calories/calories_page_content";
import { Center, HStack, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { Button } from "../recipes/button";

export function QuickAddRemoveButton(props: {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (item: Item) => void;
}) {
  const { items, addItem, removeItem } = props;

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
      <HStack key={quickItem.name} width="400px">
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
          safe="solid"
          colorPalette="green"
          rounded="xl"
          key={`${quickItem.name}-add`}
          onClick={() => addItem(quickItem)}
          width="1/6"
        >{`+`}</Button>
        <Button
          safe="solid"
          colorPalette="green"
          rounded="xl"
          key={`${quickItem.name}-remove`}
          onClick={() => removeItem(quickItem)}
          width="1/6"
        >{`-`}</Button>
        <Button
          unsafe="solid"
          colorPalette="green"
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
