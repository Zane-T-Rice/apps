import { Field, Input } from "@chakra-ui/react";
import { FormFields } from "./auto_form_drawer";
import { validateWithErrors } from "@/app/utils/fetch/validate_with_errors";
import { Schema } from "yup";
import { Dispatch, SetStateAction } from "react";

export function AutoFormField<
  T extends FormFields<T>,
  S extends Schema,
>(props: {
  field: T;
  resourceSchema?: S;
  submit: () => Promise<void>;
  errors: { [Property in keyof T]?: string };
  setErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
}) {
  const { field, resourceSchema, submit, setErrors, errors } = props;

  const validate = (value: string) => {
    validateWithErrors(() => {
      resourceSchema?.validateSyncAt(field.name.toString(), {
        [field.name]: value,
      });
      return [field.name];
    }, setErrors);
  };

  return (
    <Field.Root invalid={!!errors[field.name]} required key={field.id}>
      <Field.Label>
        {field.name.toString()} <Field.RequiredIndicator />
      </Field.Label>
      <Input
        _selection={{
          bg: {
            base: "rgba(0,0,0,0.25)",
            _dark: "rgba(255,255,255,0.5)",
          },
        }}
        placeholder={field.placeholder}
        onChange={(e) => {
          field.setField(e);
          validate(e.target.value);
        }}
        value={field.value}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit();
          }
        }}
      />
      <Field.ErrorText>{errors[field.name]}</Field.ErrorText>
    </Field.Root>
  );
}
