"use client";

import {
  CloseButton,
  Drawer,
  DrawerOpenChangeDetails,
  Portal,
} from "@chakra-ui/react";
import { Button } from "../recipes/button";
import { ReactNode, useState } from "react";

export function SharedDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: () => Promise<boolean>;
  resetFields: () => void;
  body: ReactNode;
  disableSave: boolean;
  title: string;
}) {
  const { isOpen, setIsOpen, onSubmit, resetFields, body, disableSave, title } =
    props;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cancelling the drawer should reset the fields.
  const cancel = () => {
    setIsOpen(false);
    resetFields();
  };

  // Successfully saving the drawer should reset the fields.
  const successfulSave = () => {
    setIsOpen(false);
    resetFields();
  };

  const submit = async () => {
    if (disableSave || isSubmitting) return;
    setIsSubmitting(true);
    const response = await onSubmit();
    if (response) {
      successfulSave();
    }
    setIsSubmitting(false);
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
            <Drawer.Body
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submit();
                }
              }}
            >
              {body}
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
                disabled={disableSave || isSubmitting}
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
