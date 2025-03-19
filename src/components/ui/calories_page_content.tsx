import { LuChartLine, LuTable } from "react-icons/lu";
import { Flex, HStack, Tabs } from "@chakra-ui/react";
import DataTable from "./data_table";
import { useState } from "react";
import AddItemButtonGroup from "./add_item_button_group";

export type Item = {
  name: string;
  amount: number;
};

export default function CaloriesPageContent() {
  const [items, setItems] = useState<Item[]>([]);

  return (
    <Tabs.Root defaultValue="charts" variant="line" lazyMount unmountOnExit>
      <Flex direction="row" borderColor="black" padding="2px">
        <Tabs.List maxWidth="75%" overflow="hidden" marginEnd="auto">
          <Tabs.Trigger value="charts">
            <LuChartLine />
            Calories
          </Tabs.Trigger>
          <Tabs.Trigger value="raw_data">
            <LuTable />
            Raw Data
          </Tabs.Trigger>
        </Tabs.List>
        <HStack>
          <AddItemButtonGroup
            clearItems={() => {
              setItems([]);
            }}
            addItem={(item) => {
              setItems([...items, item]);
            }}
            items={items}
          />
        </HStack>
      </Flex>
      <Tabs.Content value="charts" marginLeft="10">
        {
          // Ring showing target, current calories with ring
          // filling up to the percent of calories consumed
        }
      </Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={items} style={{}} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
