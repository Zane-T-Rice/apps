"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedSummoner, setSelectedSummoner] = useState<string[]>([]);
  const [selectedSummon, setSelectedSummon] = useState<string[]>([]);

  const getTypeSelectOptions = useMemo(() => {
    const dedupeMap: { [key: string]: boolean } = {};
    templates
      .filter((template) => {
        return template.stats[0]?.summon?.rank === "Summon";
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

  const getSummonSelectOptions = useMemo(() => {
    const summonTemplates = templates
      .filter((template) => {
        return (
          template.type === selectedType[0] &&
          template.stats[0]?.summon?.rank === "Summon"
        );
      })
      .map((summonTemplate) => summonTemplate.stats[0].summon);
    const selectOptions = summonTemplates
      .map((summon) => {
        return {
          label: summon!.name!,
          value: summon!.name!,
        };
      })
      .sort((a, b) => {
        if (a.label > b.label) return 1;
        else if (a.label < b.label) return -1;
        else return 0;
      });
    return createListCollection({ items: selectOptions });
  }, [selectedType, templates]);

  const getSummonerOptions = useMemo(() => {
    const characterTemplates = templates.filter((template) => {
      const character = template.stats[1]?.character?.rank;
      return character?.toLowerCase() === "character";
    });
    const selectOptions = characterTemplates
      .map((template) => {
        return {
          label: template.stats[1].character!.class,
          value: template.stats[1].character!.class,
        };
      })
      .sort((a, b) => {
        if (a.label > b.label) return 1;
        else if (a.label < b.label) return -1;
        else return 0;
      });
    return createListCollection({ items: selectOptions });
  }, [templates]);

  const resetFields = useCallback(() => {
    setSelectedType([]);
    setSelectedSummon([]);
    setSelectedSummoner([]);
  }, []);

  useEffect(() => {
    const matchSummonerWithType = async () => {
      setSelectedSummon([]);
      setSelectedSummoner([]);
      if (
        selectedType.length !== 0 &&
        selectedType[0].toLowerCase() !== "item"
      ) {
        setSelectedSummoner(selectedType);
      }
    };

    matchSummonerWithType();
  }, [selectedType]);

  const submit = async () => {
    const figureStats = templates.find(
      (template) =>
        template.type === selectedType[0] &&
        template.stats[0]?.summon?.name === selectedSummon[0],
    )?.stats[0].summon;
    const figure: Figure = {
      ...figureStats,
      alignment: "ally",
      class: selectedSummoner[0],
    } as Figure;
    return await onSubmit(figure);
  };

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        <DrawerSelect
          collection={getTypeSelectOptions}
          value={selectedType}
          setValue={setSelectedType}
          label="Source Card"
        />
        <DrawerSelect
          collection={getSummonSelectOptions}
          value={selectedSummon}
          setValue={setSelectedSummon}
          label="Summon"
          hidden={selectedType.length === 0}
        />
        <DrawerSelect
          collection={getSummonerOptions}
          value={selectedSummoner}
          setValue={setSelectedSummoner}
          label="Summoner"
          hidden={selectedType.length === 0}
        />
      </Stack>
    );
  }, [
    getTypeSelectOptions,
    getSummonerOptions,
    getSummonSelectOptions,
    selectedType,
    selectedSummoner,
    selectedSummon,
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
        selectedSummoner.length === 0 ||
        selectedSummon.length === 0
      }
      title={"Add Summon"}
    />
  );
}
