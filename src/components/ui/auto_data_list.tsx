import { DataList } from "@chakra-ui/react";

export function AutoDataList<T>(props: { record: T }) {
  const { record } = props;
  return record ? (
    <DataList.Root orientation="horizontal" variant="bold">
      {(Object.keys(record) as (keyof T)[]).map((e) => (
        <DataList.Item key={e.toString()}>
          <DataList.ItemLabel>{e.toString()}</DataList.ItemLabel>
          <DataList.ItemValue color={"inherit"}>{`${record[e]}`}</DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  ) : null;
}
