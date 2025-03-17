"use client";

import { LuChartLine, LuTable } from "react-icons/lu";
import { Flex, Tabs } from "@chakra-ui/react";
import CustomFileUpload from "./custom_file_upload";
import { useEffect, useRef, useState } from "react";
import DataTable from "./data_table";
import TransactionAnalysis, {
  RawTransaction,
} from "@/app/utils/transaction_analysis";
import ChartsTabContent from "../charts_tab_content";
import { Point } from "./custom_scatter_chart";

const worker = new Worker("/thread.worker.js");

export default function NavigationBar() {
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [transactionAnalysis, setTransactionAnalysis] =
    useState<TransactionAnalysis>();
  const [account, setAccount] = useState<string>("");
  const [merchants, setMerchants] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [debits, setDebits] = useState<Point[]>([]);

  useEffect(() => {
    const listener = ({ data: { type, payload } }) => {
      // console.log(type, payload);
      if (type === "UPDATE_SUCCESS") setDebits(payload);
    };
    worker.addEventListener("message", listener);
    return () => worker.removeEventListener("message", listener);
  }, []);

  useEffect(() => {
    console.log(`HELLO: ${Date.now()}`);
    worker.postMessage({
      type: "UPDATE",
      payload: {
        transactions: transactionAnalysis?.getTransactions(
          account,
          selectedMerchants
        ),
        merchants: selectedMerchants,
      },
    });
    console.log(`HELLO 2: ${Date.now()}`);
  }, [account, selectedMerchants, transactionAnalysis]);

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

  // useEffect(() => {
  //   async function getAllDebits() {
  //     const allDebits =
  //       (await transactionAnalysis?.getTransactions(account, selectedMerchants))
  //         ?.filter((transaction) => transaction.Debit && transaction.Debit < 0)
  //         .map((transaction) => ({
  //           x: transaction["Transaction Date"].toLocaleDateString("default", {
  //             month: "2-digit",
  //             day: "2-digit",
  //             year: "numeric",
  //           }),
  //           y: transaction.Debit ?? 0,
  //         })) || [];
  //     setDebits(allDebits);
  //   }
  //   getAllDebits();
  // }, [account, selectedMerchants, transactionAnalysis]);

  return (
    <Tabs.Root defaultValue="charts" variant="line" lazyMount>
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
          allDebits={debits}
        />
      </Tabs.Content>
      {/*
      <Tabs.Content value="raw_data">
        <DataTable records={transactions} />
      </Tabs.Content>
      */}
    </Tabs.Root>
  );
}
