"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";

export function AddSummonDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: Figure) => Promise<boolean>;
  templates: Template[];
}) {
  const { isOpen, setIsOpen, onSubmit, templates } = props;
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedSummon, setSelectedSummon] = useState<string[]>([]);

  const getClassSelectOptions = useMemo(() => {
    const dedupeMap: { [key: string]: boolean } = {};
    templates
      .filter((template) => {
        return template.stats[0]?.summon?.rank === "Summon";
      })
      .forEach((template) => (dedupeMap[template.class] = true));
    const selectOptions = Object.entries(dedupeMap)
      .map(([templateClass]) => {
        return {
          label: templateClass,
          value: templateClass,
        };
      })
      .sort((a, b) => {
        if (a.label > b.label) return 1;
        else if (a.label < b.label) return -1;
        else return 0;
      });
    return createListCollection({ items: selectOptions });
  }, [templates]);

  const getSummonSelectOptions = useMemo(() => {
    const summonTemplates = templates
      .filter((template) => {
        return (
          template.class === selectedClass[0] &&
          template.stats[0]?.summon?.rank === "Summon"
        );
      })
      .map((summonTemplate) => summonTemplate.stats[0].summon);
    const selectOptions = summonTemplates
      .map((summon) => {
        return {
          label: summon?.name || "",
          value: summon?.name || "",
        };
      })
      .sort((a, b) => {
        if (a.label > b.label) return 1;
        else if (a.label < b.label) return -1;
        else return 0;
      });
    return createListCollection({ items: selectOptions });
  }, [selectedClass, templates]);

  const resetFields = useCallback(() => {
    setSelectedClass([]);
    setSelectedSummon([]);
  }, []);

  const submit = async () => {
    const figureStats = templates.find(
      (template) =>
        template.class === selectedClass[0] &&
        template.stats[0]?.summon?.name === selectedSummon[0],
    )?.stats[0].summon;
    const figure: Figure = {
      ...figureStats,
      alignment: "ally",
    } as Figure;
    const response = await onSubmit(figure);
    if (response) {
      return true;
    }
    return false;
  };

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        <DrawerSelect
          collection={getClassSelectOptions}
          value={selectedClass}
          setValue={setSelectedClass}
          label="Class"
        />
        <DrawerSelect
          collection={getSummonSelectOptions}
          value={selectedSummon}
          setValue={setSelectedSummon}
          label="Summon"
          hidden={selectedClass.length === 0}
        />
      </Stack>
    );
  }, [
    getClassSelectOptions,
    getSummonSelectOptions,
    selectedClass,
    selectedSummon,
  ]);

  return (
    <SharedDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSubmit={submit}
      resetFields={resetFields}
      body={body}
      disableSave={selectedClass.length === 0 || selectedSummon.length === 0}
      title={"Add Summon"}
    />
  );
}
