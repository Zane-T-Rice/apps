"use client";

import { getLoginCookies } from "../login/login";
import { Server } from "./server-manager-service-servers";

export type Port = {
  id: string;
  number: number;
  protocol: string;
};

export async function getPorts(server: Server): Promise<Port[] | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/ports`, {
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

export async function createPort(
  server: Server,
  port: Omit<Port, "id">
): Promise<Port | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/ports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(port),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function editPort(
  server: Server,
  port: Port
): Promise<Port | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/ports/${port.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(port),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function deletePort(
  server: Server,
  port: Pick<Port, "id">
): Promise<Port | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/ports/${port.id}`, {
    method: "DELETE",
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
