import { LuChartLine, LuTable } from "react-icons/lu";
import { Flex, Tabs } from "@chakra-ui/react";
import CustomFileUpload from "./custom_file_upload";
import { useState } from "react";
import DataTable from "./data_table";
import CustomScatterChart from "./custom_scatter_chart";

export default function NavigationBar() {
  const [transactions, setTransactions] = useState<object[]>([]);

  const setNewTransactions = (newTransactions: object[]) => {
    setTransactions(newTransactions);
  };

  const getTotalDebits = (records: object[], xAxisDataKey, yAxisDataKey) => {
    const totalDebits = {};

    records
      .filter((record) => !!record[xAxisDataKey] && !!record[yAxisDataKey])
      .forEach((record) => {
        if (totalDebits[record[xAxisDataKey]])
          totalDebits[record[xAxisDataKey]] += parseInt(record[yAxisDataKey]);
        else totalDebits[record[xAxisDataKey]] = parseInt(record[yAxisDataKey]);
      });

    const data: object[] = [];
    Object.keys(totalDebits).forEach((key) => {
      data.push({ [xAxisDataKey]: key, [yAxisDataKey]: totalDebits[key] });
    });

    return data;
  };

  const getTotalMonthlyDebits = (
    records: object[],
    xAxisDataKey,
    yAxisDataKey
  ) => {
    const totalDebits = {};

    records
      .filter((record) => !!record[xAxisDataKey] && !!record[yAxisDataKey])
      .forEach((record) => {
        if (
          totalDebits[
            record[xAxisDataKey].substring(0, 2) +
              record[xAxisDataKey].substring(5)
          ]
        )
          totalDebits[
            record[xAxisDataKey].substring(0, 2) +
              record[xAxisDataKey].substring(5)
          ] += parseInt(record[yAxisDataKey]);
        else
          totalDebits[
            record[xAxisDataKey].substring(0, 2) +
              record[xAxisDataKey].substring(5)
          ] = parseInt(record[yAxisDataKey]);
      });

    const data: object[] = [];
    Object.keys(totalDebits).forEach((key) => {
      data.push({
        [xAxisDataKey]: key,
        [yAxisDataKey]: totalDebits[key],
      });
    });

    return data;
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
      <Tabs.Content value="charts" marginLeft="10">
        <CustomScatterChart
          records={transactions}
          scatterName="Debits"
          xAxisDataKey="Transaction Date"
          yAxisDataKey="Debit"
        />
        <CustomScatterChart
          records={getTotalDebits(transactions, "Transaction Date", "Debit")}
          scatterName="Total Debits"
          xAxisDataKey="Transaction Date"
          yAxisDataKey="Debit"
        />
        <CustomScatterChart
          records={getTotalMonthlyDebits(
            transactions,
            "Transaction Date",
            "Debit"
          )}
          scatterName="Total Montly Debits"
          xAxisDataKey="Transaction Date"
          yAxisDataKey="Debit"
        />
      </Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={transactions} />{" "}
      </Tabs.Content>
    </Tabs.Root>
  );
}
