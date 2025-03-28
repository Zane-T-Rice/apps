"use client";

import { Server } from "./server_manager_service_servers";
import { useREST } from "../rest/use_rest";

export type Port = {
  id: string;
  number: number;
  protocol: string;
};

export function usePorts(server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/ports`;
  return useREST<Port>(baseUrl);
}
