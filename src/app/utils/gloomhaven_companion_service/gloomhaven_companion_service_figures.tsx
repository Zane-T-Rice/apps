"use client";

import { useREST } from "../rest/use_rest";

export type Figure = {
  id: string;
  parent: string;
  entity: string;

  rank: string | null;
  class: string;
  name: string | null;
  number: number | null;
  maximumHP: number;
  damage: number;
  xp: number | null;
  move: number | null;
  attack: number | null;
  innateOffenses: string | null;
  shield: number | null;
  innateDefenses: string | null;
  statuses: string | null;
  target: number | null;
  retaliate: number | null;
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
