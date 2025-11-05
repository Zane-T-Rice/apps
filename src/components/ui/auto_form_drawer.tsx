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
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { validateWithErrors } from "@/app/utils/fetch/validate_with_errors";
import { Schema } from "yup";

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
  errors: { [Property in keyof T]?: string };
  setErrors?: Dispatch<SetStateAction<{ [Property in keyof T]?: string }>>;
  omitFields?: (keyof T)[];
}) {
  const { isOpen, setIsOpen, title, record, onSubmit, resourceSchema, errors, omitFields, setErrors } = props;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedOnce, setSubmittedOnce] = useState<boolean>(false);
  const [fields, setFields] = useState<FormFields<T>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const resetFields = useCallback(() => {
    if (!record || (!isLoading && !isCancelled && !isSaved)) return;

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

    setIsLoading(false);
    setIsCancelled(false);
    setIsSaved(false);
    setFields(newFields);
  }, [record, omitFields, isLoading, isCancelled, isSaved]);

  // Switching records should reset the fields.
  useEffect(() => {
    setIsLoading(true)
  }, [record])

  // Whenever resetFields callback changes, invoke it to reset the fields.
  useEffect(() => {
    resetFields();
  }, [resetFields]);



  // Cancelling the drawer should reset the fields.
  const cancel = () => {
    setIsOpen(false);
    setSubmittedOnce(false);
    setIsCancelled(true);
    resetFields();
  };

  // Successfully saving the drawer should reset the fields.
  const successfulSave = () => {
    setIsOpen(false);
    setSubmittedOnce(false);
    setIsSaved(true);
    resetFields();
  }

  // An unuccessful save reveals errors on the form.
  const unsuccessfulSave = () => {
    setSubmittedOnce(true);
  }

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

  const getCombinedFields = () => {
    const combinedFields = fields.reduce((a, b) => ({ ...a, [b.name]: b.value }), {}) as T;
    if (record) {
      omitFields?.forEach(field => {
        combinedFields[field] = record[field]
      })
    }
    return combinedFields;
  }

  useEffect(() => {
    if (!isValidating) return;

    const bruh = getCombinedFields();
    console.log(bruh);
    validateWithErrors(
      () => {
        return resourceSchema?.validateSync(bruh, {
          abortEarly: false,
        });
      }, setErrors);

    setIsValidating(false);
  }, [isValidating, fields, resourceSchema, setErrors])

  const submit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    (async () => {
      const combinedFields = getCombinedFields();

      if (
        await onSubmit(combinedFields)
      ) {
        successfulSave();
      } else {
        unsuccessfulSave();
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
                      _selection={{
                        bg: {
                          base: "rgba(0,0,0,0.25)",
                          _dark: "rgba(255,255,255,0.5)"
                        }
                      }}
                      placeholder={field.placeholder}
                      onChange={(e) => {
                        field.setField(e)
                        console.log("SETTING IS VALIDATING TO TRUE")
                        setIsValidating(true);
                        // if (submittedOnce) {
                        //   validate()
                        // }
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
