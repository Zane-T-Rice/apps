"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { Server } from "./server-manager-service-servers";

export type File = {
  id: string;
  name: string;
  content: string;
};

export function useFiles() {
  const { getAccessTokenSilently } = useAuth0();

  async function getFiles(server: Server): Promise<File[] | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/files`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: accessToken,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function createFile(
    server: Server,
    file: Omit<File, "id">
  ): Promise<File | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/files`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: accessToken,
        },
        body: JSON.stringify(file),
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function editFile(server: Server, file: File): Promise<File | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/files/${file.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: accessToken,
        },
        body: JSON.stringify(file),
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function deleteFile(
    server: Server,
    file: Pick<File, "id">
  ): Promise<File | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/files/${file.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: accessToken,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  return {
    getFiles,
    createFile,
    editFile,
    deleteFile,
  };
}
