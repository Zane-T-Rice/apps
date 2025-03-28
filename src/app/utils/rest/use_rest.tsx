"use client";

import { useAuth0 } from "@auth0/auth0-react";

export function useREST<T extends { id: string }>(baseUrl: string) {
  const { getAccessTokenSilently } = useAuth0();

  async function getAllREST(): Promise<T[] | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function createREST(resource: Omit<T, "id">): Promise<T | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(resource),
    });

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function editREST(resource: T): Promise<T | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${baseUrl}/${resource.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(resource),
    });

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function deleteREST(resource: Pick<T, "id">): Promise<T | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${baseUrl}/${resource.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  // Special function to do actions on a resource (such as reboot or update for Server).
  async function actionREST(
    resource: Pick<T, "id">,
    action: string
  ): Promise<T | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${baseUrl}/${resource.id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  return {
    getAllREST,
    createREST,
    editREST,
    deleteREST,
    actionREST,
  };
}
