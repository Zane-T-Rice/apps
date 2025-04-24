"use client";

import { Server } from "./server_manager_service_servers";
import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";

export type Port = {
  id: string;
  number: number;
  protocol: string;
};

export function usePorts(host: Host, server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers/${server.id}/ports`;
  return useREST<Port>(baseUrl);
}
