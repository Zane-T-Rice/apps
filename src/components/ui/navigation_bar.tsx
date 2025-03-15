import { LuChartLine, LuFolder, LuTable } from "react-icons/lu";
import { Button, Flex, Tabs } from "@chakra-ui/react";

export default function NavigationBar() {
  return (
    <Tabs.Root defaultValue="charts" variant="line">
      <Flex direction="row" borderColor="black" padding="2px">
        <Tabs.List maxWidth="75%" overflow="hidden" marginEnd="auto">
          <Tabs.Trigger value="charts">
            <LuChartLine />
            Charts
          </Tabs.Trigger>
          <Tabs.Trigger value="raw_data">
            <LuTable />
            Raw Data
          </Tabs.Trigger>
        </Tabs.List>
        <Button variant="solid" colorPalette="green" rounded="xl">
          <LuFolder />
          Import Transactions
        </Button>
      </Flex>
      <Tabs.Content value="charts">charts</Tabs.Content>
      <Tabs.Content value="raw_data">raw data table</Tabs.Content>
    </Tabs.Root>
  );
}
