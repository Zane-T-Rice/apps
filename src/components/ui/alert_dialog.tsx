import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Button } from "../recipes/button";

export function AlertDialog(props: {
  trigger: ReactNode;
  body: ReactNode;
  onConfirm: () => void;
  titleText?: string;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: "caution" | "unsafe" | "safe";
}) {
  const {
    trigger,
    body,
    onConfirm,
    titleText,
    cancelText,
    confirmText,
    confirmVariant,
  } = props;

  return (
    <Dialog.Root role="alertdialog">
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{titleText ?? "Are you sure?"}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{body}</Dialog.Body>
            <Dialog.Context>
              {(store) => {
                return (
                  <Dialog.Footer>
                    <Button
                      variant="outline"
                      onClick={() => store.setOpen(false)}
                    >
                      {cancelText ?? "Cancel"}
                    </Button>
                    <Button
                      variant={confirmVariant ?? "unsafe"}
                      onClick={() => {
                        onConfirm();
                        store.setOpen(false);
                      }}
                    >
                      {confirmText ?? "Confirm"}
                    </Button>
                  </Dialog.Footer>
                );
              }}
            </Dialog.Context>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
