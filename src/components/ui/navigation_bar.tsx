import { LuChartLine, LuTable } from "react-icons/lu";
import { Flex, Tabs } from "@chakra-ui/react";
import CustomFileUpload from "./custom_file_upload";
import { useEffect, useState } from "react";
import DataTable from "./data_table";
import TransactionAnalysis, {
  RawTransaction,
} from "@/app/utils/transaction_analysis";
import ChartsTabContent from "../charts_tab_content";

export default function NavigationBar() {
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [transactionAnalysis, setTransactionAnalysis] =
    useState<TransactionAnalysis>();
  const [account, setAccount] = useState<string>("");
  const [merchants, setMerchants] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);

  const setNewTransactions = (newTransactions: RawTransaction[]) => {
    setTransactions(newTransactions);
  };

  useEffect(() => {
    setTransactionAnalysis(new TransactionAnalysis(transactions));
  }, [transactions]);

  useEffect(() => {
    setMerchants(transactionAnalysis?.getMerchants(account) || []);
    setSelectedMerchants(transactionAnalysis?.getMerchants(account) || []);
  }, [account, transactionAnalysis]);

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
      <Tabs.Content value="charts" marginLeft="10">
        <ChartsTabContent
          transactionAnalysis={transactionAnalysis}
          selectedMerchants={selectedMerchants}
          setSelectedMerchants={(value: string[]) =>
            setSelectedMerchants(value)
          }
          merchants={merchants}
          account={account}
          setAccount={(value: string) => setAccount(value)}
        />
      </Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={transactions} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
