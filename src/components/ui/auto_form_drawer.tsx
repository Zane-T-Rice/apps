"use client";

import {
  CloseButton,
  Drawer,
  DrawerOpenChangeDetails,
  Field,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { Button } from "../recipes/button";
import {
  ChangeEvent,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";

export type FormFields<T> = {
  id: number;
  invalid: boolean;
  required: boolean;
  name: keyof T;
  placeholder: string;
  setField: ChangeEventHandler<HTMLInputElement>;
  value: string;
};

export function AutoFormDrawer<T extends object>(props: {
  record?: T;
  title: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: T) => Promise<boolean>;
  errors: { [Property in keyof T]?: string };
  omitFields?: (keyof T)[];
}) {
  const { isOpen, setIsOpen, title, record, onSubmit, errors, omitFields } = props;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedOnce, setSubmittedOnce] = useState<boolean>(false);
  const [fields, setFields] = useState<FormFields<T>[]>([]);

  const resetFields = useCallback(() => {
    if (!record) return;

    const newFields = (Object.keys(record) as (keyof T)[])
      // Filter out any non-primitives. Maybe later make an AutoForm that
      // does something sane for arrays and associative arrays?
      // Also, I should move the field generation logic in to
      // a component that can be used outside of a drawer.
      .filter((fieldName) => {
        return !(record[fieldName] instanceof Object);
      })
      // Filter out any fields which are in the omit array.
      .filter((fieldName) => !omitFields?.find((name) => name === fieldName))
      .map((fieldName, index) => ({
        id: index,
        invalid: false,
        required: true,
        name: fieldName,
        placeholder: "",
        setField: (event: ChangeEvent<HTMLInputElement>) => {
          setFields((prev) => {
            const newField = prev[index];
            newField.value = event.target.value;
            return [
              ...prev.slice(0, index),
              newField,
              ...prev.slice(index + 1),
            ];
          });
        },
        value: `${record[fieldName]}`,
      }));

    setFields(newFields);
  }, [record, omitFields]);

  // When a new record comes in, set the default state of the input fields.
  useEffect(() => {
    resetFields();
  }, [resetFields]);

  // When a submit happens, check for invalid fields.
  useEffect(() => {
    if (!submittedOnce) return;

    setFields((prev) => {
      const newFields = prev.map((field) => ({
        ...field,
        invalid: errors[field.name] && submittedOnce,
      }));
      return newFields;
    });
  }, [setFields, submittedOnce, errors]);

  const cancel = () => {
    resetFields();
    setIsOpen(false);
  };

  const submit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    (async () => {
      const combinedFields = fields.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}) as T;
      if (record) {
        omitFields?.forEach(field => {
          combinedFields[field] = record[field]
        })
      }

      if (
        await onSubmit(combinedFields)
      ) {
        resetFields();
        setIsOpen(false);
        setSubmittedOnce(false);
      } else {
        setSubmittedOnce(true);
      }
      setIsSubmitting(false);
    })();
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(details: DrawerOpenChangeDetails) =>
        setIsOpen(details.open)
      }
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{title}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Stack direction="column" gap={5}>
                {fields.map((field) => (
                  <Field.Root invalid={field.invalid} required key={field.id}>
                    <Field.Label>
                      {field.name.toString()} <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder={field.placeholder}
                      onChange={field.setField}
                      value={field.value}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          submit();
                        }
                      }}
                    />
                    <Field.ErrorText>{errors[field.name]}</Field.ErrorText>
                  </Field.Root>
                ))}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer>
              <Button
                variant="outline"
                onClick={() => {
                  cancel();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="safe"
                onClick={() => submit()}
                disabled={
                  fields.findIndex(
                    (field) =>
                      field.value === undefined ||
                      field.value === null ||
                      field.value === ""
                  ) !== -1 || isSubmitting
                }
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
