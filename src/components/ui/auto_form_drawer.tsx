"use client";

import {
  CloseButton,
  Drawer,
  DrawerOpenChangeDetails,
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
import { Schema } from "yup";
import { AutoFormField } from "./auto_form_field";
import { validateWithErrors } from "@/app/utils/fetch/validate_with_errors";

export type FormFields<T> = {
  id: number;
  invalid: boolean;
  required: boolean;
  name: keyof T;
  placeholder: string;
  setField: ChangeEventHandler<HTMLInputElement>;
  value: string;
};

export function AutoFormDrawer<T extends object, S extends Schema>(props: {
  record?: T;
  title: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: T) => Promise<boolean>;
  resourceSchema: S;
  omitFields?: (keyof T)[];
}) {
  const {
    isOpen,
    setIsOpen,
    title,
    record,
    onSubmit,
    resourceSchema,
    omitFields,
  } = props;

  const [fields, setFields] = useState<FormFields<T>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [Property in keyof T]?: string }>({});

  const resetFields = useCallback((): FormFields<T>[] => {
    return record
      ? (Object.keys(record) as (keyof T)[])
          // Filter out any non-primitives. Maybe later make an AutoForm that
          // does something sane for arrays and associative arrays?
          // Also, I should move the field generation logic in to
          // a component that can be used outside of a drawer.
          .filter((fieldName) => {
            return !(record[fieldName] instanceof Object);
          })
          // Filter out any fields which are in the omit array.
          .filter(
            (fieldName) => !omitFields?.find((name) => name === fieldName),
          )
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
          }))
      : [];
  }, [record, omitFields, setFields]);

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

      if (await onSubmit(resourceSchema?.cast(combinedFields))) {
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
                      field.value === undefined ||
                      field.value === null ||
                      field.value === "",
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
