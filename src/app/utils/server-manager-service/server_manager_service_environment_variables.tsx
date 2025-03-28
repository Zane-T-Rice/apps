"use client";

import { Server } from "./server_manager_service_servers";
import { useREST } from "../rest/use_rest";

export type EnvironmentVariable = {
  id: string;
  name: string;
  value: string;
};

export function useEnvironmentVariables(server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/environmentVariables`;
  return useREST<EnvironmentVariable>(baseUrl);
}
