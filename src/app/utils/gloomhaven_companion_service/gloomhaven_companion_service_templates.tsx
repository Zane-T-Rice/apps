"use client";

import { useREST } from "../rest/use_rest";
import { Figure } from "./gloomhaven_companion_service_figures";

// Whose a template or edition is, from the point of view of the person looking at it.
// "system" ones are defined by admins, "mine" are the person's own, and "shared" are the ones
// made by someone else in one of the same campaigns.
export type Scope = "system" | "mine" | "shared";

export type Template = {
  id: string;
  parent: string;
  entity: string;
  updatedAt: string;

  scope: Scope;
  editionId: string;
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
  return useREST<Template, "id" | "parent" | "entity" | "scope">(
    baseUrl,
    responseTransformer,
  );
}

// Only for creating. Admins use it to make a template for everyone instead of for themselves.
export function useSystemTemplates(
  responseTransformer?: (
    response: Template | Template[],
  ) => Template | Template[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/templates?scope=system`;
  return useREST<Template, "id" | "parent" | "entity" | "scope">(
    baseUrl,
    responseTransformer,
  );
}
