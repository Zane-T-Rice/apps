import { ListCollection, Select } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

export function DrawerSelect(
  props: {
    collection: ListCollection;
    setValue: Dispatch<SetStateAction<string[]>>;
    value?: string[];
    label: string;
  } & Select.RootProps,
) {
  const { collection, setValue, value, label, ...rootProps } = props;

  return (
    <Select.Root
      collection={collection}
      value={value}
      onValueChange={(e) => setValue(e.value)}
      {...rootProps}
    >
      <Select.HiddenSelect />
      <Select.Label>{label}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.items.map((option) => (
            <Select.Item item={option} key={option.value}>
              {option.label}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}
