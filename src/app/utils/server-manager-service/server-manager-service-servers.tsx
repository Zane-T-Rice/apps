"use client";

import { useAuth0 } from "@auth0/auth0-react";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isInResponseChain: boolean;
  isUpdatable: boolean;
};

export function useServers() {
  const { getAccessTokenSilently } = useAuth0();

  async function getServers(): Promise<Server[] | null> {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function createServer(
    server: Omit<Server, "id">
  ): Promise<Server | null> {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(server),
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function editServer(server: Server): Promise<Server | null> {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(server),
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function deleteServer(
    server: Pick<Server, "id">
  ): Promise<Server | null> {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function rebootServer(
    server: Pick<Server, "id">
  ): Promise<Server | null> {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/restart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function updateServer(
    server: Pick<Server, "id">
  ): Promise<Server | null> {
    const accessToken = await getAccessTokenSilently();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  return {
    getServers,
    createServer,
    editServer,
    deleteServer,
    rebootServer,
    updateServer,
  };
}
