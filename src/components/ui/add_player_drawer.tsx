"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { Figure } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_figures";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";
import { useEditionFilter } from "@/app/utils/gloomhaven_companion_ui/editions_context";
import { templateLabel } from "@/app/utils/gloomhaven_companion_ui/template_kind";

export function AddPlayerDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: Figure) => Promise<boolean>;
  templates: Template[];
}) {
  const { isOpen, setIsOpen, onSubmit, templates } = props;
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const {
    editions,
    editionCollection,
    showEditionSelect,
    selectedEdition,
    setSelectedEdition,
    resetEdition,
    filteredTemplates,
  } = useEditionFilter(templates);

  const getClassSelectOptions = useMemo(() => {
    const playerTemplates = filteredTemplates.filter((template) => {
      return template.stats[1]?.character?.rank === "Character";
    });
    const selectOptions = playerTemplates
      .map((template) => {
        return {
          label: templateLabel(template, editions, filteredTemplates),
          value: template.id,
        };
      })
      .sort((a, b) => {
        if (a.label > b.label) return 1;
        else if (a.label < b.label) return -1;
        else return 0;
      });
    return createListCollection({ items: selectOptions });
  }, [filteredTemplates, editions]);

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
    setSelectedLevel([]);
    resetEdition();
  }, [resetEdition]);

  const submit = async () => {
    const template = templates.find(
      (template) => template.id === selectedClass[0],
    );
    const figureStats = template?.stats[parseInt(selectedLevel[0])].character;
    const figure: Figure = {
      ...figureStats,
      alignment: "ally",
      editionId: template?.editionId,
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
              setSelectedClass([]);
            }}
            label="Edition (optional)"
          />
        )}
        <DrawerSelect
          collection={getClassSelectOptions}
          value={selectedClass}
          setValue={setSelectedClass}
          label={"Class"}
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
    showEditionSelect,
    editionCollection,
    selectedEdition,
    setSelectedEdition,
    getClassSelectOptions,
    getLevelSelectOptions,
    selectedClass,
    selectedLevel,
  ]);

  return (
    <SharedDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSubmit={submit}
      resetFields={resetFields}
      body={body}
      disableSave={selectedClass.length === 0 || selectedLevel.length === 0}
      title={"Add Player"}
    />
  );
}
