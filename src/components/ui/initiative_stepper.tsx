import { Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Button } from "../recipes/button";

export const MINIMUM_INITIATIVE = -29;
export const MAXIMUM_INITIATIVE = 129;
// Where the first tap on a step button starts from.
const STARTING_INITIATIVE = 0;

const clamp = (initiative: number) =>
  Math.min(MAXIMUM_INITIATIVE, Math.max(MINIMUM_INITIATIVE, initiative));

// Type the number, or use small steps for the exact number and large ones to get close, which also
// covers items that move initiative by 10 or 30. Typed numbers save when the player is done
// (enter or leaving the field) so the other players never see a half typed number.
export function InitiativeStepper(props: {
  label: string;
  // What it is for, when it is not the initiative (the second card).
  title?: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const { label, title = "Initiative", value, onSave } = props;
  // What is being typed. Null whenever nothing is, so the saved value shows (including changes
  // other players make).
  const [draft, setDraft] = useState<string | null>(null);

  const saved = parseInt(value);
  const initiative = isNaN(saved) ? null : saved;
  const step = (by: number) => {
    setDraft(null);
    onSave(`${clamp((initiative ?? STARTING_INITIATIVE) + by)}`);
  };

  const saveDraft = () => {
    if (draft === null) return;
    setDraft(null);
    // Emptying the field clears the initiative. Anything else that is not a number is dropped.
    if (draft === "") return onSave("");
    const typed = parseInt(draft);
    if (!isNaN(typed)) onSave(`${clamp(typed)}`);
  };

  const stepButton = (by: number) => (
    <Button
      key={by}
      aria-label={`${by < 0 ? "Lower" : "Raise"} ${label} ${title.toLowerCase()} by ${Math.abs(by)}`}
      variant="outline"
      height={10}
      paddingX={0}
      minWidth="2.75rem"
      disabled={
        initiative !== null &&
        (by < 0
          ? initiative <= MINIMUM_INITIATIVE
          : initiative >= MAXIMUM_INITIATIVE)
      }
      onClick={() => step(by)}
    >
      {by > 0 ? `+${by}` : by}
    </Button>
  );

  return (
    <Stack direction="row" alignItems="center" gap={1} wrap="wrap">
      <Text fontWeight="semibold" marginRight={1} minWidth="6.5rem">
        {title}
      </Text>
      {stepButton(-10)}
      {stepButton(-1)}
      <Input
        aria-label={`${label} ${title.toLowerCase()}`}
        placeholder="--"
        inputMode="numeric"
        width="4.5rem"
        height={10}
        textAlign="center"
        fontSize="xl"
        fontWeight="bold"
        value={draft ?? value}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          if (/^-?\d{0,3}$/.test(e.target.value)) setDraft(e.target.value);
        }}
        onBlur={saveDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {stepButton(1)}
      {stepButton(10)}
      <Button
        aria-label={`Clear ${label} ${title.toLowerCase()}`}
        variant="outline"
        height={10}
        paddingX={0}
        minWidth="2.75rem"
        visibility={initiative === null ? "hidden" : "visible"}
        onClick={() => {
          setDraft(null);
          onSave("");
        }}
      >
        ×
      </Button>
    </Stack>
  );
}
