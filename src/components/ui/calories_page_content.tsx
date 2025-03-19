import { LuChartLine, LuTable } from "react-icons/lu";
import { Field, Flex, HStack, Input, Tabs } from "@chakra-ui/react";
import DataTable from "./data_table";
import AddItemButtonGroup from "./add_item_button_group";
import { Cell, Pie, PieChart } from "recharts";
import { useLocalStorage } from "@/app/utils/use_local_storage";

export type Item = {
  name: string;
  amount: number;
};

const COLORS = ["#AA8042", "#00C49F", "#EEEE00", "#FF0000"];
const fontSize = 20;

export default function CaloriesPageContent() {
  const [items, setItems] = useLocalStorage<Item[]>("items", []);
  const [target, setTarget] = useLocalStorage<number>("target", 0);

  const value = items.map((item) => item.amount).reduce((a, b) => a + b, 0);
  const outerRadius = 160;
  const innerRadius = outerRadius / 2;
  const cx = outerRadius;
  const cy = outerRadius;

  const data = [
    {
      name: "Target",
      value: target - value,
    },
    {
      name: "Actual",
      value: value,
    },
  ];

  const sectorColor = (index: number) => {
    if (index > 0) {
      if (value > target) {
        return COLORS[2];
      } else if (target - value > target) {
        return COLORS[3];
      }
    }
    return COLORS[index % COLORS.length];
  };

  return (
    <Tabs.Root defaultValue="charts" variant="line" lazyMount unmountOnExit>
      <Flex direction="row" borderColor="black" padding="2px">
        <Tabs.List maxWidth="75%" overflow="hidden" marginEnd="auto">
          <Tabs.Trigger value="charts">
            <LuChartLine />
            Calories
          </Tabs.Trigger>
          <Tabs.Trigger value="raw_data">
            <LuTable />
            Raw Data
          </Tabs.Trigger>
        </Tabs.List>
        <HStack>
          <Field.Root>
            <HStack>
              <Field.Label>Calorie Target</Field.Label>
              <Input
                placeholder="1600"
                onChange={(event) => {
                  const newValue = event.target.value.replace(/\D/g, "");
                  setTarget(newValue !== "" ? parseInt(newValue) : 0);
                }}
                value={target}
              />
            </HStack>
          </Field.Root>
          <AddItemButtonGroup
            clearItems={() => {
              setItems([]);
            }}
            addItem={(item) => {
              setItems([...items, item]);
            }}
            items={items}
          />
        </HStack>
      </Flex>
      <Tabs.Content value="charts" marginLeft="10">
        {items.length > 0 ? (
          <PieChart width={outerRadius * 2 + 10} height={outerRadius * 2 + 10}>
            <Pie
              data={data}
              cx={cx}
              cy={cy}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={sectorColor(index)} />
              ))}
            </Pie>
            <text x={cx - 54} y={cy} style={{ fontSize }}>
              Calories Left
            </text>
            <text
              x={cx - ((target - value).toString().length - 1) * 4.5}
              y={cy + 20}
              style={{ fontSize }}
            >
              {target - value}
            </text>
          </PieChart>
        ) : null}
      </Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={items} style={{ marginLeft: 10 }} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
