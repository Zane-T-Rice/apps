"use client";

import { useREST } from "../rest/use_rest";

// An auth0 user or machine-to-machine application which could be linked to a server. These are
// not saved anywhere yet, so the service uses the auth0 user id as their id.
export type Auth0User = {
  id: string;
  userId: string; // auth0 user id (or <client_id>@clients for machines)
  email?: string; // auth0 email
  applicationName?: string; // name of the auth0 machine-to-machine application
  type: "user" | "machine";
};

// getAllREST takes a query of search=<part of an email or machine name> to search, or
// all=true&page=<n> to list everyone a page at a time. One email can belong to several auth0
// users, so they are identified by their auth0 user id.
export function useAuth0Users() {
  return useREST<Auth0User>(
    `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/auth0-users`,
  );
}
