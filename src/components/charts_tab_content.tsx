import TransactionAnalysis from "@/app/utils/transaction_analysis";
import {
  createListCollection,
  HStack,
  Portal,
  Select,
  Stack,
} from "@chakra-ui/react";
import CustomScatterChart from "./ui/custom_scatter_chart";
import { useEffect, useMemo, useState } from "react";
import DataTable from "./ui/data_table";

export default function ChartsTabContent(props: {
  transactionAnalysis?: TransactionAnalysis;
  selectedMerchants: string[];
  setSelectedMerchants: (merchants: string[]) => void;
  merchants: string[];
  account: string;
  setAccount: (account: string) => void;
}) {
  const {
    account,
    transactionAnalysis,
    selectedMerchants,
    setSelectedMerchants,
    merchants,
    setAccount,
  } = props;

  const [internalSelectedMerchants, setInternalSelectedMerchants] = useState<
    string[]
  >([]);

  useEffect(() => {
    setInternalSelectedMerchants(merchants);
  }, [merchants]);

  const accountsCollection = useMemo(() => {
    return createListCollection({
      items:
        transactionAnalysis
          ?.getAccounts()
          .map((account) => ({ label: account, value: account })) || [],
    });
  }, [transactionAnalysis]);

  const merchantsCollection = useMemo(() => {
    return createListCollection({
      items:
        merchants.map((description) => ({
          label: description,
          value: description,
        })) || [],
    });
  }, [merchants]);

  const merchantsList = useMemo(() => {
    return merchants.map((description) => (
      <Select.Item item={description} key={description}>
        {description}
        <Select.ItemIndicator />
      </Select.Item>
    ));
  }, [merchants]);

  const accountsList = useMemo(() => {
    return transactionAnalysis?.getAccounts().map((account) => (
      <Select.Item item={account} key={account}>
        {account}
        <Select.ItemIndicator />
      </Select.Item>
    ));
  }, [transactionAnalysis]);

  const monthlyDebits =
    transactionAnalysis
      ?.getMonthlyTotals(account, selectedMerchants)
      ?.map((monthlyTotal) => ({
        x: monthlyTotal.transactionDate.toLocaleDateString("default", {
          month: "2-digit",
          year: "numeric",
        }),
        y: monthlyTotal.total,
      })) || [];
  const averageMonthlyDebit = (
    monthlyDebits.map((debit) => debit.y).reduce((a, b) => a + b, 0) /
    monthlyDebits.length
  ).toFixed(2);

  const debitCharts = (
    <>
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getTransactions(account, selectedMerchants)
            ?.filter(
              (transaction) => transaction.Debit && transaction.Debit < 0
            )
            .map((transaction) => ({
              x: transaction["Transaction Date"].toLocaleDateString("default", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }),
              y: transaction.Debit ?? 0,
            })) || []
        }
        scatterName="Debits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Debit"
        reversedYAxis
      />
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getDailyTotals(account, selectedMerchants)
            ?.map((dailyTotal) => ({
              x: dailyTotal.transactionDate.toLocaleDateString("default", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }),
              y: dailyTotal.total,
            })) || []
        }
        scatterName="Daily Total Debits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Debit"
        reversedYAxis
      />
      <CustomScatterChart
        records={monthlyDebits}
        scatterName="Monthly Total Debits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Debit"
        reversedYAxis
      />
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getYearlyTotals(account, selectedMerchants)
            ?.map((yearlyTotal) => ({
              x: yearlyTotal.transactionDate.toLocaleDateString("default", {
                year: "numeric",
              }),
              y: yearlyTotal.total,
            })) || []
        }
        scatterName="Yearly Total Debits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Debit"
        reversedYAxis
      />
    </>
  );

  const creditCharts = (
    <>
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getTransactions(account, selectedMerchants)
            ?.filter(
              (transaction) => transaction.Credit && transaction.Credit > 0
            )
            .map((transaction) => ({
              x: transaction["Transaction Date"].toLocaleDateString("default", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }),
              y: transaction.Credit ?? 0,
            })) || []
        }
        scatterName="Credits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Credit"
        reversedYAxis={false}
      />
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getDailyTotals(account, selectedMerchants, "Credit")
            ?.map((monthlyTotal) => ({
              x: monthlyTotal.transactionDate.toLocaleDateString("default", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }),
              y: monthlyTotal.total,
            })) || []
        }
        scatterName="Daily Total Credits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Credit"
        reversedYAxis={false}
      />
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getMonthlyTotals(account, selectedMerchants, "Credit")
            ?.map((monthlyTotal) => ({
              x: monthlyTotal.transactionDate.toLocaleDateString("default", {
                month: "2-digit",
                year: "numeric",
              }),
              y: monthlyTotal.total,
            })) || []
        }
        scatterName="Monthly Total Credits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Credit"
        reversedYAxis={false}
      />
      <CustomScatterChart
        records={
          transactionAnalysis
            ?.getYearlyTotals(account, selectedMerchants, "Credit")
            ?.map((yearlyTotal) => ({
              x: yearlyTotal.transactionDate.toLocaleDateString("default", {
                year: "numeric",
              }),
              y: yearlyTotal.total,
            })) || []
        }
        scatterName="Yearly Total Credits"
        xAxisDataKey="Transaction Date"
        yAxisDataKey="Credit"
        reversedYAxis={false}
      />
    </>
  );

  return account ? (
    <>
      <HStack style={{ marginLeft: 5, marginRight: 5 }}>
        <Select.Root
          collection={accountsCollection}
          size="sm"
          width="320px"
          onValueChange={(value) => {
            setAccount(value.value[0]);
          }}
          value={[account]}
        >
          <Select.HiddenSelect />
          <Select.Label>Account</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select account" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>{accountsList}</Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
        <Select.Root
          collection={merchantsCollection}
          size="sm"
          width="320px"
          onValueChange={(value) => {
            setInternalSelectedMerchants(value.value);
          }}
          onBlur={() => {
            setSelectedMerchants(internalSelectedMerchants);
          }}
          value={internalSelectedMerchants}
          multiple
        >
          <Select.HiddenSelect />
          <Select.Label>Merchant</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select merchants" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>{merchantsList}</Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </HStack>
      {selectedMerchants && selectedMerchants.length > 0 ? (
        <Stack style={{ marginLeft: 5 }}>
          <DataTable
            records={[{ "Average Monthly Debit": averageMonthlyDebit }]}
            style={{
              marginTop: "10px",
              marginBottom: "10px",
            }}
          />
          <Stack hideFrom="md">{debitCharts}</Stack>
          <HStack hideBelow="md">{debitCharts}</HStack>
          <Stack hideFrom="md">{creditCharts}</Stack>
          <HStack hideBelow="md">{creditCharts}</HStack>
        </Stack>
      ) : null}
    </>
  ) : null;
}
