"use client";

import { Server } from "./server_manager_service_servers";
import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";

export type EnvironmentVariable = {
  id: string;
  name: string;
  value: string;
};

export function useEnvironmentVariables(host: Host, server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers/${server.id}/environmentVariables`;
  return useREST<EnvironmentVariable>(baseUrl);
}
