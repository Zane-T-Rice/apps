import { LuChartLine, LuTable } from "react-icons/lu";
import { HStack, Stack, Tabs } from "@chakra-ui/react";
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
    const defaultAccount = transactionAnalysis?.getAccounts()?.[0];
    if (defaultAccount) setAccount(defaultAccount);
  }, [transactionAnalysis]);

  useEffect(() => {
    setMerchants(transactionAnalysis?.getMerchants(account) || []);
    setSelectedMerchants(transactionAnalysis?.getMerchants(account) || []);
  }, [account, transactionAnalysis]);

  const clearTransactions = () => {
    setTransactions([]);
    setTransactionAnalysis(new TransactionAnalysis([]));
    setMerchants([]);
    setSelectedMerchants([]);
    setAccount("");
  };

  const navbarbuttons = (
    <>
      <Tabs.List marginEnd="auto">
        <Tabs.Trigger value="charts">
          <LuChartLine />
          Charts
        </Tabs.Trigger>
        <Tabs.Trigger value="raw_data">
          <LuTable />
          Raw Data
        </Tabs.Trigger>
      </Tabs.List>
      <HStack mdDown={{ marginLeft: 1 }}>
        <CustomFileUpload
          clearTransactions={clearTransactions}
          setTransactions={setNewTransactions}
          transactions={transactions}
        />
      </HStack>
    </>
  );

  return (
    <Tabs.Root defaultValue="charts" variant="line" lazyMount unmountOnExit>
      <HStack hideBelow="md">{navbarbuttons}</HStack>
      <Stack hideFrom="md">{navbarbuttons}</Stack>
      <Tabs.Content value="charts">
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
        <DataTable records={transactions} style={{ marginLeft: 10 }} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
