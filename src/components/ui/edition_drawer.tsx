"use client";

import { Checkbox, Field, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { Edition } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { SharedDrawer } from "./shared_drawer";

// Make an edition, or rename one. Mount it when it is wanted, and set `key` so that each use
// starts over.
export function EditionDrawer(props: {
  // The edition to rename. Left out when making a new one.
  editing?: Edition;
  editions: Edition[];
  isAdmin: boolean;
  onClose: () => void;
  onSave: (name: string, system: boolean) => Promise<boolean>;
}) {
  const { editing, editions, isAdmin, onClose, onSave } = props;
  const [name, setName] = useState<string>(editing?.name ?? "");
  const [system, setSystem] = useState<boolean>(editing?.scope === "system");

  const trimmed = name.trim();
  const taken = editions.some(
    (edition) =>
      edition.id !== editing?.id &&
      edition.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );

  const body = (
    <Stack direction="column" gap={5}>
      <Field.Root required invalid={taken}>
        <Field.Label>Name</Field.Label>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field.HelperText>
          {'A group for templates, i.e. "Homebrew" or "Frosthaven".'}
        </Field.HelperText>
        <Field.ErrorText>
          There is already an edition with that name.
        </Field.ErrorText>
      </Field.Root>
      {isAdmin && !editing && (
        <Checkbox.Root
          variant="outline"
          checked={system}
          onCheckedChange={(e) => setSystem(!!e.checked)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>
            System edition (read only for everyone but admins)
          </Checkbox.Label>
        </Checkbox.Root>
      )}
    </Stack>
  );

  return (
    <SharedDrawer
      isOpen={true}
      setIsOpen={(open) => !open && onClose()}
      onSubmit={() => onSave(trimmed, system)}
      resetFields={() => {}}
      body={body}
      disableSave={!trimmed || taken}
      title={editing ? "Rename Edition" : "New Edition"}
    />
  );
}
