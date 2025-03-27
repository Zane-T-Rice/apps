"use server";

import { getLoginCookies } from "../login/login";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isInResponseChain: boolean;
  isUpdatable: boolean;
};

export async function getServers(): Promise<Server[] | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(url, {
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
