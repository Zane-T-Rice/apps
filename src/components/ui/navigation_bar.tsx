import { LuChartLine, LuTable } from "react-icons/lu";
import { Flex, Tabs } from "@chakra-ui/react";
import CustomFileUpload from "./custom_file_upload";
import { useState } from "react";
import DataTable from "../data_table";

export default function NavigationBar() {
  const [transactions, setTransactions] = useState<object[]>([]);

  const setNewTransactions = (newTransactions: object[]) => {
    setTransactions(newTransactions);
  };

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
        <CustomFileUpload setTransactions={setNewTransactions} />
      </Flex>
      <Tabs.Content value="charts">charts</Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={transactions} />{" "}
      </Tabs.Content>
    </Tabs.Root>
  );
}
