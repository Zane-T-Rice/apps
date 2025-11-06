"use client";

import { useREST } from "../rest/use_rest";

export type JoinCampaign = {
  id: string; // Is set to campaignId for the /join action. Unused otherwise.
  code: string;
};

export function useCreateJoinCampaignCode() {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/campaigns`;
  return useREST<JoinCampaign, "id">(baseUrl);
}
