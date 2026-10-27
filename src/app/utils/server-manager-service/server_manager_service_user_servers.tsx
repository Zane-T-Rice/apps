"use client";

import { useREST } from "../rest/use_rest";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isUpdatable: boolean;
  host: { name: string };
  ports: { number: number }[];
  status: string;
};

export function useUserServers() {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/users/servers`;
  return useREST<Server>(baseUrl);
}
