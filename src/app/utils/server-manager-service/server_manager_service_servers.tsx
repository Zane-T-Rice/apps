"use client";

import { useREST } from "../rest/use_rest";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isInResponseChain: boolean;
  isUpdatable: boolean;
};

export function useServers() {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers`;
  return useREST<Server>(baseUrl);
}
