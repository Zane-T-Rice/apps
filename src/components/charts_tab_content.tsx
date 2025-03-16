import TransactionAnalysis from "@/app/utils/transaction_analysis";
import { createListCollection, HStack, Portal, Select } from "@chakra-ui/react";
import CustomScatterChart from "./ui/custom_scatter_chart";

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

  return (
    <>
      <HStack>
        <Select.Root
          collection={createListCollection({
            items:
              transactionAnalysis
                ?.getAccounts()
                .map((account) => ({ label: account, value: account })) || [],
          })}
          size="sm"
          width="320px"
          onValueChange={(value) => {
            setAccount(value.value[0]);
          }}
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
              <Select.Content>
                {transactionAnalysis?.getAccounts().map((account) => (
                  <Select.Item item={account} key={account}>
                    {account}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
        <Select.Root
          collection={createListCollection({
            items:
              merchants.map((description) => ({
                label: description,
                value: description,
              })) || [],
          })}
          size="sm"
          width="320px"
          onValueChange={(value) => {
            setSelectedMerchants(value.value);
          }}
          value={selectedMerchants}
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
              <Select.Content>
                {merchants.map((description) => (
                  <Select.Item item={description} key={description}>
                    {description}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </HStack>
      <HStack>
        <CustomScatterChart
          records={
            transactionAnalysis
              ?.getTransactions(account, selectedMerchants)
              ?.filter(
                (transaction) => transaction.Debit && transaction.Debit < 0
              )
              .map((transaction) => ({
                x: transaction["Transaction Date"].toLocaleDateString(
                  "default",
                  {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  }
                ),
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
              ?.map((monthlyTotal) => ({
                x: monthlyTotal.transactionDate.toLocaleDateString("default", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                }),
                y: monthlyTotal.total,
              })) || []
          }
          scatterName="Daily Total Debits"
          xAxisDataKey="Transaction Date"
          yAxisDataKey="Debit"
          reversedYAxis
        />
        <CustomScatterChart
          records={
            transactionAnalysis
              ?.getMonthlyTotals(account, selectedMerchants)
              ?.map((monthlyTotal) => ({
                x: monthlyTotal.transactionDate.toLocaleDateString("default", {
                  month: "2-digit",
                  year: "numeric",
                }),
                y: monthlyTotal.total,
              })) || []
          }
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
      </HStack>
      <HStack>
        <CustomScatterChart
          records={
            transactionAnalysis
              ?.getTransactions(account, selectedMerchants)
              ?.filter(
                (transaction) => transaction.Credit && transaction.Credit > 0
              )
              .map((transaction) => ({
                x: transaction["Transaction Date"].toLocaleDateString(
                  "default",
                  {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  }
                ),
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
      </HStack>
    </>
  );
}
