"use client";

import { useREST } from "../rest/use_rest";
import { Campaign } from "./gloomhaven_companion_service_campaigns";
import { JoinCampaign } from "./gloomhaven_companion_service_create_join_campaign_code";

export function useJoinCampaign(
  responseTransformer?: (
    response: Campaign | Campaign[],
  ) => Campaign | Campaign[],
) {
  const baseUrl = `${process.env.NEXT_PUBLIC_GLOOMHAVEN_COMPANION_SERVICE_DOMAIN}/join`;
  return useREST<JoinCampaign, "id", Campaign>(baseUrl, responseTransformer);
}
