"use client";

import { useGetAccessToken } from "../use_access_token";
import { useCallback } from "react";
import { useGetAllREST } from "../rest/use_rest";

// One key/value pair of table state for a scenario (the round, an element, someone's initiative).
// Every key is saved on its own so players changing different keys can not overwrite each other.
export type State = {
  parent: string;
  entity: string;
  value: string | null;
};

export const STATE_ENTITY_PREFIX = "#STATE#";

export const getStateKey = (state: Pick<State, "entity">) =>
  state.entity.slice(STATE_ENTITY_PREFIX.length);

export function useScenarioState(campaignId: string, scenarioId: string) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/campaigns/${campaignId}/scenarios/${scenarioId}/state`;
  const getAccessToken = useGetAccessToken();

  const getAllState = useGetAllREST<State>(baseUrl);

  const putState = useCallback(
    async (key: string, value: string): Promise<State | null> => {
      const accessToken = await getAccessToken();

      const response = await fetch(baseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ key, value }),
      });

      if (response.status !== 200) {
        return null;
      }

      return response.json();
    },
    [baseUrl, getAccessToken],
  );

  return { getAllState, putState };
}
