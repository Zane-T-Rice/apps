"use client";

import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";
import { Server } from "./server_manager_service_servers";

export type Volume = {
  id: string;
  hostPath: string;
  containerPath: string;
};

export function useVolumes(host: Host, server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers/${server.id}/volumes`;
  return useREST<Volume>(baseUrl);
}
