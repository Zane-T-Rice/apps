"use client";

import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isInResponseChain: boolean;
  isUpdatable: boolean;
  hostId: string;
};

export function useServers(host: Host) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers`;
  return useREST<Server>(baseUrl);
}
