"use client";

import { useAuth0 } from "@auth0/auth0-react";

export function useREST<
  T extends { id: string }, // The main resource type
  // Any keys to exclude from create and edit.
  // Edit will still receive "id" even if you include it here.
  K extends keyof T = "id",
>(baseUrl: string, responseTransformer?: (response: T | T[]) => T | T[]) {
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

    const parsedResponse = await response.json();
    return responseTransformer?.(parsedResponse) || parsedResponse;
  }

  async function createREST(resource: Omit<T, K>): Promise<T | null> {
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

    const parsedResponse = await response.json();
    return responseTransformer?.(parsedResponse) || parsedResponse;
  }

  async function editREST(
    resource: Omit<T, K> & { id: string },
  ): Promise<T | null> {
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

    const parsedResponse = await response.json();
    return responseTransformer?.(parsedResponse) || parsedResponse;
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

    const parsedResponse = await response.json();
    return responseTransformer?.(parsedResponse) || parsedResponse;
  }

  // Special function to do actions on a resource (such as reboot or update for Server).
  async function actionREST(
    resource: Pick<T, "id">,
    action: string,
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

    const parsedResponse = await response.json();
    return responseTransformer?.(parsedResponse) || parsedResponse;
  }

  return {
    getAllREST,
    createREST,
    editREST,
    deleteREST,
    actionREST,
  };
}
