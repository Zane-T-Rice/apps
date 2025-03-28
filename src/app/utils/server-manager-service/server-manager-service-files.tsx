"use client";

import { getLoginCookies } from "../login/login";
import { Server } from "./server-manager-service-servers";

export type File = {
  id: string;
  name: string;
  content: string;
};

export async function getFiles(server: Server): Promise<File[] | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/files`, {
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

export async function createFile(
  server: Server,
  file: Omit<File, "id">
): Promise<File | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(file),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function editFile(
  server: Server,
  file: File
): Promise<File | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/files/${file.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
    body: JSON.stringify(file),
  });

  if (response.status !== 200) {
    return null;
  }

  return await response.json();
}

export async function deleteFile(
  server: Server,
  file: Pick<File, "id">
): Promise<File | null> {
  const [username, password, url]: string[] = await getLoginCookies();

  const response = await fetch(`${url}/${server.id}/files/${file.id}`, {
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
