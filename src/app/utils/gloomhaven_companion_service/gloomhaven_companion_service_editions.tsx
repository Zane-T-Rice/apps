"use client";

import { useREST } from "../rest/use_rest";
import { Scope } from "./gloomhaven_companion_service_templates";

// A named group of templates, i.e. "Gloomhaven 2E" or someone's "Homebrew".
export type Edition = {
  id: string;
  parent: string;
  entity: string;
  updatedAt: string | null;

  scope: Scope;
  name: string;
};

export function useEditions(
  responseTransformer?: (response: Edition | Edition[]) => Edition | Edition[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/templates/editions`;
  return useREST<Edition, "id" | "parent" | "entity" | "scope">(
    baseUrl,
    responseTransformer,
  );
}

// Only for creating. Admins use it to make an edition for everyone instead of for themselves.
export function useSystemEditions(
  responseTransformer?: (response: Edition | Edition[]) => Edition | Edition[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/templates/editions?scope=system`;
  return useREST<Edition, "id" | "parent" | "entity" | "scope">(
    baseUrl,
    responseTransformer,
  );
}
