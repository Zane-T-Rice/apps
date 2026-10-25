"use client";

import { useREST } from "../rest/use_rest";
import { Host } from "./server_manager_service_hosts";

export type Server = {
  id: string;
};

export type UserServerLink = {
  id: string;
  userId: string; // auth0 user id (or <client_id>@clients for machines)
  email: string | null; // auth0 email
  applicationName: string | null; // name of the auth0 machine-to-machine application
};

export function useUserServerLinks(host: Host, server: Server | null) {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts/${host.id}/servers/${server?.id}/users`;
  return useREST<UserServerLink>(baseUrl);
}
