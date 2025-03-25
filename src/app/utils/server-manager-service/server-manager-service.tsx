"use server";

import { cookies as nextCookies } from "next/headers";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isInResponseChain: boolean;
  isUpdatable: boolean;
};

export async function getServers(): Promise<Server[] | null> {
  const cookies = await nextCookies();
  const [username, password]: string[] = [
    cookies.get("username"),
    cookies.get("password"),
  ].map((cookie) => (cookie ? decodeURIComponent(cookie.value) : ""));

  const response = await fetch(process.env.SERVER_MANAGER_SERVICE_URL || "", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}
