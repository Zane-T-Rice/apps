"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";
import { useEditionFilter } from "@/app/utils/gloomhaven_companion_ui/editions_context";
import { templateLabel } from "@/app/utils/gloomhaven_companion_ui/template_kind";

// A source card is told apart from the same card in another edition by the edition in its key.
const sourceKey = (template: Template) =>
  `${template.editionId}|${template.type}`;
const splitSourceKey = (key: string = "") => {
  const at = key.indexOf("|");
  return { editionId: key.slice(0, at), type: key.slice(at + 1) };
};

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
  const {
    editions,
    editionCollection,
    showEditionSelect,
    selectedEdition,
    setSelectedEdition,
    resetEdition,
    filteredTemplates,
  } = useEditionFilter(templates);

  const getTypeSelectOptions = useMemo(() => {
    const dedupeMap: { [key: string]: Template } = {};
    filteredTemplates
      .filter((template) => {
        return template.stats[0]?.summon?.rank === "Summon";
      })
      .forEach((template) => (dedupeMap[sourceKey(template)] = template));
    return createListCollection({
      items: Object.keys(dedupeMap)
        .map((key) => ({
          label: templateLabel(dedupeMap[key], editions, filteredTemplates),
          value: key,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    });
  }, [filteredTemplates, editions]);

  const getSummonSelectOptions = useMemo(() => {
    const summonTemplates = templates
      .filter((template) => {
        const source = splitSourceKey(selectedType[0]);
        return (
          template.type === source.type &&
          template.editionId === source.editionId &&
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
    resetEdition();
  }, [resetEdition]);

  useEffect(() => {
    const matchSummonerWithType = async () => {
      setSelectedSummon([]);
      setSelectedSummoner([]);
      const source = splitSourceKey(selectedType[0]);
      if (selectedType.length !== 0 && source.type.toLowerCase() !== "item") {
        setSelectedSummoner([source.type]);
      }
    };

    matchSummonerWithType();
  }, [selectedType]);

  const submit = async () => {
    const source = splitSourceKey(selectedType[0]);
    const template = templates.find(
      (template) =>
        template.type === source.type &&
        template.editionId === source.editionId &&
        template.stats[0]?.summon?.name === selectedSummon[0],
    );
    const figureStats = template?.stats[0].summon;
    const figure: Figure = {
      ...figureStats,
      alignment: "ally",
      editionId: template?.editionId,
      class: selectedSummoner[0],
    } as Figure;
    return await onSubmit(figure);
  };

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        {showEditionSelect && (
          <DrawerSelect
            collection={editionCollection}
            value={selectedEdition}
            setValue={(value) => {
              setSelectedEdition(value);
              setSelectedType([]);
            }}
            label="Edition (optional)"
          />
        )}
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
    showEditionSelect,
    editionCollection,
    selectedEdition,
    setSelectedEdition,
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
