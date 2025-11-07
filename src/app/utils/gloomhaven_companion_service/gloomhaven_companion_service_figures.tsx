"use client";

import { useREST } from "../rest/use_rest";

export type Figure = {
  id: string;
  parent: string;
  entity: string;

  rank: string;
  class: string;
  name: string;
  number: number;
  maximumHP: number;
  damage: number;
  xp: number;
  move: number;
  attack: number;
  innateOffenses: string;
  shield: number;
  innateDefenses: string;
  statuses: string;
};

export function useFigures(
  campaignId: string,
  scenarioId: string,
  responseTransformer?: (response: Figure | Figure[]) => Figure | Figure[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/campaigns/${campaignId}/scenarios/${scenarioId}/figures`;
  return useREST<Figure, "id" | "parent" | "entity">(
    baseUrl,
    responseTransformer,
  );
}
