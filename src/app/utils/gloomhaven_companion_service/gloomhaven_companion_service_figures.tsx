"use client";

import { useREST } from "../rest/use_rest";

export type Figure = {
  id: string;
  parent: string;
  entity: string;
  updatedAt: string | null;

  rank: string | null;
  class: string;
  name: string | null;
  // What this figure is called in this scenario, shown instead of its name. The name itself is
  // left alone, since it also says which figure this is.
  nickname: string | null;
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
  pierce: number | null;
  range: number | null;
  special: string | null;
  alignment: string | null;
  attackPlusC: boolean | null;
  flying: boolean | null;
};

// What to call a figure: the nickname it was given, or else its name.
export const getFigureName = (figure: Pick<Figure, "name" | "nickname">) =>
  figure.nickname || figure.name;

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
