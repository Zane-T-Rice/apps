import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { useRestoreFocus } from "@/app/utils/use_restore_focus";
import { Button } from "../recipes/button";

export function AlertDialog(props: {
  // The button that opens it. Left out when `open` is given, so that one dialog can be shared by
  // many buttons.
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  body: ReactNode;
  onConfirm: () => void;
  titleText?: string;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: "caution" | "unsafe" | "safe";
}) {
  const {
    trigger,
    open,
    onOpenChange,
    body,
    onConfirm,
    titleText,
    cancelText,
    confirmText,
    confirmVariant,
  } = props;

  const [ownOpen, setOwnOpen] = useState<boolean>(false);
  const isOpen = open ?? ownOpen;
  const setIsOpen = onOpenChange ?? setOwnOpen;
  const finalFocusEl = useRestoreFocus(isOpen);

  return (
    <Dialog.Root
      role="alertdialog"
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
      finalFocusEl={finalFocusEl}
    >
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
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
