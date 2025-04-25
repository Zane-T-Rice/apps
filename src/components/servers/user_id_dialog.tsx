import { useState } from "react";
import { Button } from "../recipes/button";
import { AlertDialog } from "../ui/alert_dialog";
import { Input, Stack, Text } from "@chakra-ui/react";

export function UserIdDialog<
  T extends { applicationName: string; containerName: string }
>(props: {
  triggerButtonText: string;
  description: string;
  confirmText: string;
  confirmVariant: "caution" | "unsafe";
  selectedServer: T | null;
  onConfirm: (selectedServer: T, user: { id: string }) => Promise<boolean>;
}) {
  const {
    triggerButtonText,
    description,
    confirmText,
    confirmVariant,
    selectedServer,
    onConfirm,
  } = props;
  const [userId, setUserId] = useState<string>("");

  return (
    <AlertDialog
      trigger={
        <Button variant="safe" disabled={!selectedServer} width="100%">
          {triggerButtonText}
        </Button>
      }
      body={
        <Stack>
          <Text>{description}</Text>
          <Input
            placeholder="Enter the user's id."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </Stack>
      }
      onConfirm={async () => {
        if (selectedServer && userId) onConfirm(selectedServer, { id: userId });
        setUserId("");
      }}
      confirmText={confirmText}
      confirmVariant={confirmVariant}
    />
  );
}
