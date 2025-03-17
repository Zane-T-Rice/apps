import { DataTransaction } from "@/app/utils/transaction_analysis";
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

export type Point = {
  x: number | string;
  y: number | string;
};

export default function CustomScatterChart(props: {
  minimumY?: number | string;
  records: Point[];
  scatterName: string;
  xAxisDataKey: keyof DataTransaction;
  yAxisDataKey: keyof DataTransaction;
  reversedYAxis: boolean;
}) {
  const {
    minimumY: maximumY,
    records,
    scatterName,
    xAxisDataKey,
    yAxisDataKey,
    reversedYAxis,
  } = props;

  return (
    <ResponsiveContainer width="60%" height={250}>
      <ScatterChart
        margin={{
          top: 20,
          right: 10,
          bottom: 10,
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
          reversed={reversedYAxis}
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter
          name={scatterName}
          data={records
            .filter((record) => !maximumY || record.y >= maximumY)
            .map((record) => ({
              [xAxisDataKey]: record.x,
              [yAxisDataKey]: record.y,
            }))}
          fill="#8884d8"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
