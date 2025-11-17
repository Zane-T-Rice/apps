"use client";

import { useREST } from "../rest/use_rest";

export type Scenario = {
  id: string;
  name: string;
  parent: string;
  entity: string;
  scenarioLevel: number;
  groups: string;
};

export function useScenarios(
  campaignId: string,
  responseTransformer?: (
    response: Scenario | Scenario[],
  ) => Scenario | Scenario[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/campaigns/${campaignId}/scenarios`;
  return useREST<Scenario, "id" | "parent" | "entity">(
    baseUrl,
    responseTransformer,
  );
}
