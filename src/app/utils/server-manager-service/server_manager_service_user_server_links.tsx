"use client";

import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";

export type Server = {
  id: string;
};

export type UserServerLink = {
  id: string; // auth0 user id
  userId: string; // auth0 user id
};

export function useUserServerLinks(host: Host, server: Server | null) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers/${server?.id}/users`;
  return useREST<UserServerLink>(baseUrl);
}
