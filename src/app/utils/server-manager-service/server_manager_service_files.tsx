"use client";

import { Server } from "./server_manager_service_servers";
import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";

export type File = {
  id: string;
  name: string;
  content: string;
};

export function useFiles(host: Host, server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers/${server.id}/files`;
  return useREST<File>(baseUrl);
}
