"use client";

import { useREST } from "../rest/use_rest";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isUpdatable: boolean;
  host: { url: string };
  ports: { number: number }[];
};

export function useUserServers() {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/users/servers`;
  return useREST<Server>(baseUrl);
}
