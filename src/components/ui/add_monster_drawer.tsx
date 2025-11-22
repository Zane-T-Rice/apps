"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";

export function AddMonsterDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: Figure) => Promise<boolean>;
  templates: Template[];
  alignment: string;
}) {
  const { isOpen, setIsOpen, onSubmit, templates, alignment } = props;
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);

  const getClassSelectOptions = useMemo(() => {
    const enemyTemplates = templates.filter((template) => {
      return (
        template.stats[0]?.normal?.rank?.toLowerCase() === "normal" ||
        template.stats[0]?.elite?.rank?.toLowerCase() === "elite"
      );
    });
    const selectOptions = enemyTemplates
      .map((template) => {
        return {
          label: template.type,
          value: template.type,
        };
      })
      .sort((a, b) => {
        if (a.label > b.label) return 1;
        else if (a.label < b.label) return -1;
        else return 0;
      });
    return createListCollection({ items: selectOptions });
  }, [templates]);

  const getRankSelectOptions = useMemo(() => {
    const selectOptions = ["Elite", "Normal"].map((type) => {
      return {
        label: type,
        value: type,
      };
    });
    return createListCollection({ items: selectOptions });
  }, []);

  const getLevelSelectOptions = useMemo(() => {
    const selectOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
      return {
        label: level,
        value: level,
      };
    });
    return createListCollection({ items: selectOptions });
  }, []);

  const resetFields = useCallback(() => {
    setSelectedClass([]);
    setSelectedRank([]);
    setSelectedLevel([]);
  }, []);

  const submit = async () => {
    let figure: Figure | undefined;

    const figureStats = templates.find(
      (template) => template.type == selectedClass[0],
    )?.stats[parseInt(selectedLevel[0])];

    if (selectedRank[0] === "Normal")
      figure = {
        ...figureStats?.normal,
        alignment,
      } as Figure;
    else if (selectedRank[0] === "Elite")
      figure = {
        ...figureStats?.elite,
        alignment,
      } as Figure;

    if (figure === undefined) return false;
    return await onSubmit(figure);
  };

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        <DrawerSelect
          collection={getClassSelectOptions}
          value={selectedClass}
          setValue={setSelectedClass}
          label={"Class"}
        />
        <DrawerSelect
          collection={getRankSelectOptions}
          value={selectedRank}
          setValue={setSelectedRank}
          label={"Rank"}
        />
        <DrawerSelect
          collection={getLevelSelectOptions}
          value={selectedLevel}
          setValue={setSelectedLevel}
          label={"Level"}
        />
      </Stack>
    );
  }, [
    getClassSelectOptions,
    getLevelSelectOptions,
    getRankSelectOptions,
    selectedClass,
    selectedRank,
    selectedLevel,
  ]);

  const doDisableSave = useCallback(() => {
    return (
      selectedClass.length === 0 ||
      selectedRank.length == 0 ||
      selectedLevel.length === 0
    );
  }, [selectedClass, selectedLevel, selectedRank]);

  return (
    <SharedDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSubmit={submit}
      resetFields={resetFields}
      body={body}
      disableSave={doDisableSave()}
      title={"Add Monster"}
    />
  );
}
