"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createListCollection } from "@chakra-ui/react";
import { Edition } from "../gloomhaven_companion_service/gloomhaven_companion_service_editions";
import { Template } from "../gloomhaven_companion_service/gloomhaven_companion_service_templates";

// The editions that the templates can be in, for the menus that pick a template.
export const EditionsContext = createContext<Edition[]>([]);

export const useEditionList = () => useContext(EditionsContext);

// Lets a menu of templates be narrowed down to one edition. Nothing is narrowed until an edition
// is picked, and the choice is not offered when all the templates are in the same edition.
export function useEditionFilter(templates: Template[]) {
  const editions = useEditionList();
  const [selectedEdition, setSelectedEdition] = useState<string[]>([]);

  const editionCollection = useMemo(() => {
    const used = new Set(templates.map((template) => template.editionId));
    return createListCollection({
      items: editions
        .filter((edition) => used.has(edition.id))
        .map((edition) => ({ label: edition.name, value: edition.id })),
    });
  }, [editions, templates]);

  const filteredTemplates = useMemo(
    () =>
      selectedEdition.length
        ? templates.filter(
            (template) => template.editionId === selectedEdition[0],
          )
        : templates,
    [templates, selectedEdition],
  );

  const resetEdition = useCallback(() => setSelectedEdition([]), []);

  return {
    editions,
    editionCollection,
    showEditionSelect: editionCollection.items.length > 1,
    selectedEdition,
    setSelectedEdition,
    resetEdition,
    filteredTemplates,
  };
}
