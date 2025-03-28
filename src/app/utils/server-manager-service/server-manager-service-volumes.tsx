"use client";

import { getLoginCookies } from "../login/login";
import { Server } from "./server-manager-service-servers";

export type Volume = {
  id: string;
  hostPath: string;
  containerPath: string;
};

export async function getVolumes(server: Server): Promise<Volume[] | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/volumes`, {
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

export async function createVolume(
  server: Server,
  volume: Omit<Volume, "id">
): Promise<Volume | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/volumes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(volume),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function editVolume(
  server: Server,
  volume: Volume
): Promise<Volume | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/volumes/${volume.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(volume),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function deleteVolume(
  server: Server,
  volume: Pick<Volume, "id">
): Promise<Volume | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/volumes/${volume.id}`, {
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
