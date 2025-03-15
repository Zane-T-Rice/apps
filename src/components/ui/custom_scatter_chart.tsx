import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CustomScatterChart(props: {
  scatterName: string;
  records: object[];
  xAxisDataKey: string;
  yAxisDataKey: string;
}) {
  const { records, scatterName, xAxisDataKey, yAxisDataKey } = props;

  return (
    <ResponsiveContainer width="60%" height={250}>
      <ScatterChart
        margin={{
          top: 20,
          right: 10,
          bottom: 10,
          left: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisDataKey}
          type="category"
          name={xAxisDataKey}
          allowDuplicatedCategory={false}
        />
        <YAxis
          dataKey={yAxisDataKey}
          type="number"
          name={yAxisDataKey}
          reversed
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter
          name={scatterName}
          data={records
            .filter(
              (record) => !!record[xAxisDataKey] && !!record[yAxisDataKey]
            )
            .map((record) => ({
              ...record,
              [yAxisDataKey]: parseInt(record[yAxisDataKey]),
            }))}
          fill="#8884d8"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
