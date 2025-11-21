import { Field, Input } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";

export function SharedStringInput(props: {
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
  title: string;
}) {
  const { value, setValue, title } = props;
  return (
    <Field.Root>
      <Field.Label>{title}</Field.Label>
      <Input
        _selection={{
          bg: {
            base: "rgba(0,0,0,0.25)",
            _dark: "rgba(255,255,255,0.5)",
          },
        }}
        placeholder={""}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        value={value || ""}
      />
    </Field.Root>
  );
}
