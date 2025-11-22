"use client";

import { useREST } from "../rest/use_rest";
import { Figure } from "./gloomhaven_companion_service_figures";

export type Template = {
  id: string;
  parent: string;
  entity: string;
  updatedAt: string;

  standeeLimit: number;
  type: string;
  stats: {
    [key: number]: {
      normal?: Figure;
      elite?: Figure;
      character?: Figure;
      summon?: Figure;
      boss?: Figure;
    };
  };
};

export function useTemplates(
  responseTransformer?: (
    response: Template | Template[],
  ) => Template | Template[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/templates`;
  return useREST<Template, "id" | "parent" | "entity">(
    baseUrl,
    responseTransformer,
  );
}
