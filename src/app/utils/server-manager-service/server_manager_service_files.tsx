"use client";

import { Server } from "./server_manager_service_servers";
import { useREST } from "../rest/use_rest";

export type File = {
  id: string;
  name: string;
  content: string;
};

export function useFiles(server: Server) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/files`;
  return useREST<File>(baseUrl);
}
