import { LuChartLine, LuTable } from "react-icons/lu";
import { Field, HStack, Input, Stack, Tabs } from "@chakra-ui/react";
import DataTable from "./data_table";
import AddItemButtonGroup from "./add_item_button_group";
import { Cell, Pie, PieChart } from "recharts";
import { useLocalStorage } from "@/app/utils/use_local_storage";
import { QuickAddButton } from "./quick_add_button";

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
  const outerRadius = 130;
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

  const addItem = (item: Item) => {
    setItems([...items, item]);
  };

  const removeItem = (item: Item) => {
    const index = items.findIndex((e) => e.name === item.name);
    setItems(items.filter((e, i) => i !== index));
  };

  const content = (
    <>
      <Tabs.List marginEnd="auto">
        <Tabs.Trigger value="charts">
          <LuChartLine />
          Calories
        </Tabs.Trigger>
        <Tabs.Trigger value="raw_data">
          <LuTable />
          Raw Data
        </Tabs.Trigger>
      </Tabs.List>
      <HStack mdDown={{ marginLeft: 1 }}>
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
                minWidth={`${Math.max(4, target.toString().length * 14)}px`}
              />
            </HStack>
          </Field.Root>
          <AddItemButtonGroup
            clearItems={() => {
              setItems([]);
            }}
            addItem={addItem}
            items={items}
          />
        </HStack>
      </HStack>
    </>
  );

  return (
    <Tabs.Root defaultValue="charts" variant="line" lazyMount unmountOnExit>
      <Stack hideFrom="md">{content}</Stack>
      <HStack hideBelow="md">{content}</HStack>
      <Tabs.Content value="charts">
        <Stack>
          <PieChart
            width={outerRadius * 2 + 10}
            height={outerRadius * 2 + 10}
            style={{ marginLeft: 70 }}
          >
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
          <QuickAddButton
            items={items}
            addItem={addItem}
            removeItem={removeItem}
          />
        </Stack>
      </Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={items} style={{ marginLeft: 10 }} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
