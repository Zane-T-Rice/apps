"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";

export function AddBossDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: Figure) => Promise<boolean>;
  templates: Template[];
}) {
  const { isOpen, setIsOpen, onSubmit, templates } = props;
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedNumberOfCharacters, setSelectedNumberOfCharacters] = useState<
    string[]
  >([]);

  const getTypeSelectOptions = useMemo(() => {
    const dedupeMap: { [key: string]: boolean } = {};
    templates
      .filter((template) => {
        return template.stats[0]?.boss?.rank?.toLowerCase() === "boss";
      })
      .forEach((template) => (dedupeMap[template.type] = true));
    return createListCollection({
      items: Object.keys(dedupeMap)
        .sort()
        .map((type) => {
          return {
            label: type,
            value: type,
          };
        }),
    });
  }, [templates]);

  const getLevelSelectOptions = useMemo(() => {
    const selectOptions = ["0", "1", "2", "3", "4", "5", "6", "7"].map(
      (level) => {
        return {
          label: level,
          value: level,
        };
      },
    );
    return createListCollection({ items: selectOptions });
  }, []);

  const getNumberOfCharactersOptions = useMemo(() => {
    const selectOptions = ["1", "2", "3", "4"].map((numberOfCharacters) => ({
      label: numberOfCharacters,
      value: numberOfCharacters,
    }));
    return createListCollection({ items: selectOptions });
  }, []);

  const resetFields = useCallback(() => {
    setSelectedType([]);
    setSelectedLevel([]);
    setSelectedNumberOfCharacters([]);
  }, []);

  const submit = async () => {
    const figureStats = templates.find(
      (template) => template.type === selectedType[0],
    )?.stats[parseInt(selectedLevel[0])].boss;

    if (!figureStats) return false;

    const figure: Figure = {
      ...figureStats,
      maximumHP:
        figureStats.maximumHP * parseInt(selectedNumberOfCharacters[0]),
      alignment: "enemy",
    } as Figure;

    if (figureStats.attackPlusC) {
      figure.attack =
        figureStats.attack! + parseInt(selectedNumberOfCharacters[0]);
    }

    return await onSubmit(figure);
  };

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        <DrawerSelect
          collection={getTypeSelectOptions}
          value={selectedType}
          setValue={setSelectedType}
          label="Name"
        />
        <DrawerSelect
          collection={getLevelSelectOptions}
          value={selectedLevel}
          setValue={setSelectedLevel}
          label="Level"
        />
        <DrawerSelect
          collection={getNumberOfCharactersOptions}
          value={selectedNumberOfCharacters}
          setValue={setSelectedNumberOfCharacters}
          label="Number of Characters"
        />
      </Stack>
    );
  }, [
    getTypeSelectOptions,
    getNumberOfCharactersOptions,
    getLevelSelectOptions,
    selectedType,
    selectedLevel,
    selectedNumberOfCharacters,
  ]);

  return (
    <SharedDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSubmit={submit}
      resetFields={resetFields}
      body={body}
      disableSave={
        selectedType.length === 0 ||
        selectedLevel.length === 0 ||
        selectedNumberOfCharacters.length === 0
      }
      title={"Add Boss"}
    />
  );
}
