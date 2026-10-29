"use client";

import { Checkbox, Drawer, Field, Grid, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { Edition } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { Button } from "../recipes/button";

// The body and footer of a drawer, for making an edition or renaming one. What is typed is kept
// here, not in the page, so that typing does not draw the whole page again.
export function EditionForm(props: {
  // The edition to rename. Left out when making a new one.
  editing?: Edition;
  editions: Edition[];
  isAdmin: boolean;
  onSave: (
    name: string,
    system: boolean,
    editing?: Edition,
  ) => Promise<boolean>;
  // Called when the form is finished with, whether or not it saved.
  onDone: () => void;
}) {
  const { editing, editions, isAdmin, onSave, onDone } = props;
  const [name, setName] = useState<string>(editing?.name ?? "");
  const [system, setSystem] = useState<boolean>(editing?.scope === "system");
  const [saving, setSaving] = useState<boolean>(false);

  const trimmed = name.trim();
  const taken = editions.some(
    (edition) =>
      edition.id !== editing?.id &&
      edition.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  const canSubmit = !!trimmed && !taken && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const saved = await onSave(trimmed, system, editing);
    setSaving(false);
    if (saved) onDone();
  };

  return (
    <>
      <Drawer.Body>
        <Stack
          gap={5}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        >
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
      </Drawer.Body>
      <Drawer.Footer>
        <Grid
          width="100%"
          gap={2}
          templateColumns="repeat(2, 1fr)"
          css={{ "& > button": { width: "100%" } }}
        >
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button variant="safe" disabled={!canSubmit} onClick={submit}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Grid>
      </Drawer.Footer>
    </>
  );
}
