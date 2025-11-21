"use client";

import { Stack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { SharedDrawer } from "./shared_drawer";
import { SharedNumberInput } from "./shared_number_input";
import { SharedStringInput } from "./shared_string_input";

export function AddNPCDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: Figure) => Promise<boolean>;
  alignment: string;
}) {
  const { isOpen, setIsOpen, onSubmit, alignment } = props;
  const [name, setName] = useState<string | null>(null);
  const [maximumHP, setMaximumHP] = useState<number | null>(0);
  const [damage, setDamage] = useState<number | null>(0);
  const [move, setMove] = useState<number | null>(null);
  const [attack, setAttack] = useState<number | null>(null);
  const [special, setSpecial] = useState<string | null>(null);

  const resetFields = useCallback(() => {
    setName(null);
    setMaximumHP(0);
    setDamage(0);
    setMove(null);
    setAttack(null);
    setSpecial(null);
  }, []);

  const submit = useCallback(async () => {
    const figure: Figure = {
      name,
      maximumHP,
      damage,
      move,
      attack,
      special,
      alignment,
      class: "NPC / Obstacle",
    } as Figure;
    const response = await onSubmit(figure);
    if (response) {
      return true;
    }
    return false;
  }, [name, maximumHP, damage, move, attack, special, alignment, onSubmit]);

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        <SharedStringInput value={name} setValue={setName} title={"Name"} />
        <SharedNumberInput
          value={maximumHP}
          setValue={setMaximumHP}
          title={"Maximum HP"}
        />
        <SharedNumberInput
          value={damage}
          setValue={setDamage}
          title={"Damage"}
        />
        <SharedNumberInput value={move} setValue={setMove} title={"Move"} />
        <SharedNumberInput
          value={attack}
          setValue={setAttack}
          title={"Attack"}
        />
        <SharedStringInput
          value={special}
          setValue={setSpecial}
          title={"Special"}
        />
      </Stack>
    );
  }, [name, maximumHP, damage, move, attack, special]);

  const doDisableSave = useCallback(() => {
    return maximumHP === null || damage === null;
  }, [maximumHP, damage]);

  return (
    <SharedDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSubmit={submit}
      resetFields={resetFields}
      body={body}
      disableSave={doDisableSave()}
      title={"Add NPC / Obstacle"}
    />
  );
}
