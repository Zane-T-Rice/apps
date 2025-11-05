"use client";

import { useREST } from "../rest/use_rest";

export type Figure = {
  id: string;
  parent: string;
  entity: string;

  name: string;
  maximumHP: number;
  damage: number;
  class: string;
  number: number;
  rank: string;
  shield: number;
  move: number;
  attack: number;
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
