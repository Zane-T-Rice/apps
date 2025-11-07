"use client";

import {
  CloseButton,
  Drawer,
  DrawerOpenChangeDetails,
  Portal,
  Stack,
} from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { useCallback, useEffect, useState } from "react";
import { Schema, SchemaDescription, SchemaObjectDescription } from "yup";
import { AutoFormField } from "./auto_form_field";
import { validateWithErrors } from "@/app/utils/fetch/validate_with_errors";

export type FormFields<T> = {
  id: number;
  invalid: boolean;
  required: boolean;
  name: keyof T;
  placeholder: string;
  setField: (event: { target: { value: string } }) => void;
  value: string | number;
};

export function AutoFormDrawer<T extends object, S extends Schema>(props: {
  record?: T;
  title: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: T) => Promise<boolean>;
  resourceSchema: S;
  omitFields?: (keyof T)[];
  desiredFieldOrder?: { [Property in keyof T]?: number };
}) {
  const {
    isOpen,
    setIsOpen,
    title,
    record,
    onSubmit,
    resourceSchema,
    omitFields,
    desiredFieldOrder,
  } = props;

  const [fields, setFields] = useState<FormFields<T>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [Property in keyof T]?: string }>({});

  const resetFields = useCallback((): FormFields<T>[] => {
    const isFieldRequired = (fieldName: keyof T): boolean => {
      return !(
        (resourceSchema.describe() as SchemaObjectDescription).fields[
          fieldName
        ] as SchemaDescription
      )?.optional;
    };

    return record
      ? (Object.keys(record) as (keyof T)[])
          // Filter out any non-primitives. Maybe later make an AutoForm that
          // does something sane for arrays and associative arrays.
          .filter((fieldName) => {
            return !(record[fieldName] instanceof Object);
          })
          // Filter out any fields which are in the omit array.
          .filter(
            (fieldName) => !omitFields?.find((name) => name === fieldName),
          )
          .sort((aField, bField) => {
            if (!desiredFieldOrder) return 0;

            const a = desiredFieldOrder[aField];
            const b = desiredFieldOrder[bField];

            if (a === 0 && b !== 0) return -1;
            else if (a !== 0 && b === 0) return 1;

            if (a && b) {
              if (a < b) return -1;
              else if (a > b) return 1;
            }

            if (a && !b) return -1;
            else if (!a && b) return 1;

            if (!a && !b) return 0;

            return 0;
          })
          .map((fieldName, index) => ({
            id: index,
            invalid: false,
            required: isFieldRequired(fieldName),
            name: fieldName,
            placeholder: "",
            setField: (event: { target: { value: string } }) => {
              setFields((prev) => {
                const newField = prev[index];
                if (typeof record[fieldName] === "number") {
                  const parsedInt = parseInt(event.target.value);
                  if (!Number.isNaN(parsedInt)) {
                    newField.value = parsedInt;
                  } else {
                    newField.value = event.target.value;
                  }
                } else {
                  newField.value = event.target.value;
                }
                return [
                  ...prev.slice(0, index),
                  newField,
                  ...prev.slice(index + 1),
                ];
              });
            },
            value:
              typeof record[fieldName] === "number"
                ? record[fieldName]
                : `${record[fieldName]}`,
          }))
      : [];
  }, [record, omitFields, resourceSchema, setFields, desiredFieldOrder]);

  useEffect(() => {
    setFields(resetFields());
  }, [resetFields]);

  // Cancelling the drawer should reset the fields.
  const cancel = () => {
    setIsOpen(false);
    setErrors?.({});
    setFields(resetFields());
  };

  // Successfully saving the drawer should reset the fields.
  const successfulSave = () => {
    setIsOpen(false);
    setErrors?.({});
    setFields(resetFields());
  };

  const submit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    (async () => {
      const combinedFields = fields.reduce(
        (a, b) => ({ ...a, [b.name]: b.value }),
        {},
      ) as T;
      if (record) {
        omitFields?.forEach((field) => {
          combinedFields[field] = record[field];
        });
      }

      let castedCombinedFields;
      try {
        castedCombinedFields = resourceSchema?.cast(combinedFields);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {}

      if (castedCombinedFields && (await onSubmit(castedCombinedFields))) {
        successfulSave();
      } else {
        validateWithErrors(() => {
          resourceSchema?.validateSync(combinedFields, {
            abortEarly: false,
          });
          return fields.map((field) => field.name);
        }, setErrors);
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
                  <AutoFormField
                    key={`auto-form-field-${field.id}`}
                    field={field}
                    resourceSchema={resourceSchema}
                    submit={submit}
                    errors={errors}
                    setErrors={setErrors}
                  />
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
                      field.required &&
                      (field.value === undefined ||
                        field.value === null ||
                        field.value === ""),
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
