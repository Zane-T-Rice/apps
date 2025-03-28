"use client";

import { getLoginCookies } from "../login/login";
import { Server } from "./server-manager-service-servers";

export type EnvironmentVariable = {
  id: string;
  name: string;
  value: string;
};

export async function getEnvironmentVariables(
  server: Server
): Promise<EnvironmentVariable[] | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/environmentVariables`, {
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

export async function createEnvironmentVariable(
  server: Server,
  environmentVariable: Omit<EnvironmentVariable, "id">
): Promise<EnvironmentVariable | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/environmentVariables`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(environmentVariable),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function editEnvironmentVariable(
  server: Server,
  environmentVariable: EnvironmentVariable
): Promise<EnvironmentVariable | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(
    `${url}/${server.id}/environmentVariables/${environmentVariable.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        owner: username,
        "authorization-key": password,
      },
      body: JSON.stringify(environmentVariable),
    }
  );

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function deleteEnvironmentVariable(
  server: Server,
  environmentVariable: Pick<EnvironmentVariable, "id">
): Promise<EnvironmentVariable | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(
    `${url}/${server.id}/environmentVariables/${environmentVariable.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        owner: username,
        "authorization-key": password,
      },
    }
  );

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}
