"use client";

import { useREST } from "../rest/use_rest";

export type Host = {
  id: string;
  name: string;
  url: string;
};

export function useHosts() {
  const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/hosts`;
  return useREST<Host>(baseUrl);
}
