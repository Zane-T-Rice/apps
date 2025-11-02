"use client";

import { useREST } from "../rest/use_rest";

export type Campaign = {
  id: string;
  name: string;
  parent: string;
  entity: string;
};

export function useCampaigns() {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/campaigns`;
  return useREST<Campaign>(baseUrl);
}
