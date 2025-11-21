import { Field, NumberInput } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

export function SharedNumberInput(props: {
  value: number | null;
  setValue: Dispatch<SetStateAction<number | null>>;
  title: string;
}) {
  const { value, setValue, title } = props;
  return (
    <Field.Root>
      <Field.Label>{title}</Field.Label>
      <NumberInput.Root
        value={value !== null ? value?.toString() : ""}
        onValueChange={(e) => {
          if (e.value !== undefined) setValue(parseInt(e.value));
          else setValue(null);
        }}
      >
        <NumberInput.Control />
        <NumberInput.Input
          placeholder={""}
          required={true}
          _selection={{
            bg: {
              base: "rgba(0,0,0,0.25)",
              _dark: "rgba(255,255,255,0.5)",
            },
          }}
        />
      </NumberInput.Root>
    </Field.Root>
  );
}
