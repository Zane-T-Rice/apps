"use client";

import { LuChartLine, LuTable } from "react-icons/lu";
import { Field, HStack, Input, Spinner, Stack, Tabs } from "@chakra-ui/react";
import DataTable from "../ui/data_table";
import AddItemButtonGroup from "./add_item_button_group";
import { Cell, Pie, PieChart } from "recharts";
import { useLocalStorage } from "@/app/utils/use_local_storage";
import { QuickAddRemoveButton } from "./quick_add_remove_button";
import { NavigationBar } from "../ui/navigation_bar";
import { useColorModeValue } from "../ui/color-mode";

export type Item = {
  name: string;
  amount: number;
};

const COLORS = ["#AA8042", "#00C49F", "#EEEE00", "#FF0000"];
const fontSize = 20;

export default function CaloriesPageContent() {
  const [items, setItems, itemsLoading] = useLocalStorage<Item[]>("items", []);
  const [target, setTarget, targetLoading] = useLocalStorage<number>(
    "target",
    1500,
  );
  const textFillColor = useColorModeValue("black", "white");

  const isLoading = itemsLoading || targetLoading;

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

  const actions = (
    <HStack mdDown={{ maxWidth: "420px" }}>
      <Field.Root width="fit-content">
        <HStack>
          <Field.Label>Calorie Target</Field.Label>
          <Input
            placeholder="1600"
            onChange={(event) => {
              const newValue = event.target.value.replace(/\D/g, "");
              setTarget(newValue !== "" ? parseInt(newValue) : 0);
            }}
            value={target}
            maxWidth={"80px"}
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
  );

  const tabTriggers = (
    <>
      <Tabs.Trigger value="charts">
        <LuChartLine />
        Calories
      </Tabs.Trigger>
      <Tabs.Trigger value="raw_data">
        <LuTable />
        Raw Data
      </Tabs.Trigger>
    </>
  );

  const tabContents = (
    <>
      <Tabs.Content value="charts">
        <Stack>
          {!isLoading ? (
            <PieChart
              width={outerRadius * 2 + 10}
              height={outerRadius * 2 + 10}
              style={{ marginLeft: 75 }}
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
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={sectorColor(index)} />
                ))}
              </Pie>
              <text
                x={cx - 54}
                y={cy}
                style={{ fontSize, fill: textFillColor }}
              >
                Calories Left
              </text>
              <text
                x={cx - ((target - value).toString().length - 1) * 4.5}
                y={cy + 20}
                style={{ fontSize, fill: textFillColor }}
              >
                {target - value}
              </text>
            </PieChart>
          ) : (
            <Spinner
              marginLeft={cx + 70}
              marginTop={cy}
              color="blue"
              size="xl"
              borderWidth="thick"
            />
          )}
          <QuickAddRemoveButton
            items={items}
            addItem={addItem}
            removeItem={removeItem}
          />
        </Stack>
      </Tabs.Content>
      <Tabs.Content value="raw_data">
        <DataTable records={items} />
      </Tabs.Content>
    </>
  );

  return (
    <NavigationBar
      defaultTab="charts"
      tabTriggers={tabTriggers}
      tabContents={tabContents}
      actions={actions}
    />
  );
}
