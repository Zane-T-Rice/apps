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
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";

export type FormFields = {
  id: number;
  invalid: boolean;
  required: boolean;
  name: string;
  placeholder: string;
  setField: ChangeEventHandler<HTMLInputElement>;
  value: string;
};

export function AutoFormDrawer<T extends object>(props: {
  record: T | null;
  title: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) {
  const { isOpen, setIsOpen, title, record } = props;

  const [submittedOnce, setSubmittedOnce] = useState<boolean>(false);
  const [fields, setFields] = useState<FormFields[]>([]);

  // When a submit happens, check for invalid fields.
  useEffect(() => {
    if (!submittedOnce) return;

    setFields((prev) => {
      const newFields = prev.map((field) => ({
        ...field,
        invalid:
          (field.value === undefined || field.value === null) && submittedOnce,
      }));
      return newFields;
    });
  }, [setFields, submittedOnce]);

  // When a new record comes in, set the default state of the input fields.
  useEffect(() => {
    if (!record) return;

    const newFields = (Object.keys(record) as (keyof T)[]).map(
      (fieldName, index) => ({
        id: index,
        invalid: false,
        required: true,
        name: fieldName.toString(),
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
      })
    );

    setFields(newFields);
  }, [record, setFields]);

  const cancel = () => {
    if (!record) return;

    const newFields = (Object.keys(record) as (keyof T)[]).map(
      (fieldName, index) => ({
        id: index,
        invalid: false,
        required: true,
        name: fieldName.toString(),
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
      })
    );

    setFields(newFields);
    setIsOpen(false);
  };

  const submit = () => {
    setSubmittedOnce(true);
    console.log("Submit: ", fields);
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
                      {field.name} <Field.RequiredIndicator />
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
                    <Field.ErrorText>This field is required</Field.ErrorText>
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
                    (field) => field.value === undefined || field.value == null
                  ) !== -1
                }
              >
                Save
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
