"use client";

import { createListCollection, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Template } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_templates";
import { DrawerSelect } from "./drawer_select";
import { SharedDrawer } from "./shared_drawer";
import { Scenario } from "@/app/utils/gloomhaven_companion_service/gloomhaven_companion_service_scenarios";
import { SharedStringInput } from "./shared_string_input";

export function ScenarioDrawer(props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (value: Scenario) => Promise<boolean>;
  templates: Template[];
  scenario?: Scenario;
}) {
  const { isOpen, setIsOpen, onSubmit, templates, scenario } = props;
  const [name, setName] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);

  useEffect(() => {
    const setFields = async () => {
      setName(scenario?.name || null);
      setSelectedClass(scenario?.groups.split(",") || []);
      setSelectedLevel(
        scenario?.scenarioLevel !== undefined
          ? [scenario.scenarioLevel.toString()]
          : [],
      );
    };
    setFields();
  }, [scenario]);

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

  const getLevelSelectOptions = useMemo(() => {
    const selectOptions = [0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
      return {
        label: level.toString(),
        value: level.toString(),
      };
    });
    return createListCollection({ items: selectOptions });
  }, []);

  const resetFields = useCallback(() => {
    setName(scenario?.name || null);
    setSelectedClass(scenario?.groups.split(",") || []);
    setSelectedLevel(
      scenario?.scenarioLevel ? [scenario.scenarioLevel.toString()] : [],
    );
  }, [scenario]);

  const submit = async () => {
    const scenarioLevel = parseInt(selectedLevel[0]);
    const newScenario: Scenario = {
      id: scenario?.id,
      entity: scenario?.entity,
      parent: scenario?.parent,
      name,
      scenarioLevel: scenarioLevel,
      groups: selectedClass.join(","),
      updatedAt: scenario?.updatedAt,
    } as Scenario;
    const response = await onSubmit(newScenario);
    if (response) {
      return true;
    }
    return false;
  };

  const body = useMemo(() => {
    return (
      <Stack direction="column" gap={5}>
        <SharedStringInput value={name} setValue={setName} title={"Name"} />
        <DrawerSelect
          collection={getLevelSelectOptions}
          value={selectedLevel}
          setValue={setSelectedLevel}
          label={"Scenario Level"}
        />
        <DrawerSelect
          collection={getClassSelectOptions}
          value={selectedClass}
          setValue={setSelectedClass}
          label={"Enemies"}
          multiple
        />
      </Stack>
    );
  }, [
    getClassSelectOptions,
    getLevelSelectOptions,
    name,
    selectedClass,
    selectedLevel,
  ]);

  const doDisableSave = useCallback(() => {
    return (
      name === null ||
      name === undefined ||
      selectedClass.length === 0 ||
      selectedLevel.length === 0
    );
  }, [name, selectedClass, selectedLevel]);

  return (
    <SharedDrawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSubmit={submit}
      resetFields={resetFields}
      body={body}
      disableSave={doDisableSave()}
      title={"Add Scenario"}
    />
  );
}
