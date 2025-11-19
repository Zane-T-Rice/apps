"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

export function useREST<
  T extends { id: string }, // The main resource type
  // Any keys to exclude from create and edit.
  // Edit will still receive "id" even if you include it here.
  K extends keyof T = "id",
  R = T, // Useful if the input resource type differs from the response type.
>(baseUrl: string, responseTransformer?: (response: R | R[]) => R | R[]) {
  const { getAccessTokenSilently } = useAuth0();

  const getAllREST: () => Promise<R[] | null> = useCallback(async () => {
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
  }, [baseUrl, getAccessTokenSilently, responseTransformer]);

  const createREST: (resource: Omit<T, K>) => Promise<R | null> = useCallback(
    async (resource: Omit<T, K>) => {
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
    },
    [baseUrl, getAccessTokenSilently, responseTransformer],
  );

  const editREST: (resource: Omit<T, K> & { id: string }) => Promise<R | null> =
    useCallback(
      async (resource: Omit<T, K> & { id: string }) => {
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
      },
      [baseUrl, getAccessTokenSilently, responseTransformer],
    );

  const deleteREST: (resource: Pick<T, "id">) => Promise<R | null> =
    useCallback(
      async (resource: Pick<T, "id">) => {
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
      },
      [baseUrl, getAccessTokenSilently, responseTransformer],
    );

  // Special function to do actions on a resource (i.e. "create-join-code", "reboot").
  const actionREST: (
    resource: Pick<T, "id">,
    action: string,
  ) => Promise<R | null> = useCallback(
    async (resource: Pick<T, "id">, action: string) => {
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
    },
    [baseUrl, getAccessTokenSilently, responseTransformer],
  );

  // A catchall POST function that gives more control over the path and response values.
  const customREST: (resource: T, path: string) => Promise<R | null> =
    useCallback(
      async (resource: T, path: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${baseUrl}/${path}`, {
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
      },
      [baseUrl, getAccessTokenSilently, responseTransformer],
    );

  return {
    getAllREST,
    createREST,
    editREST,
    deleteREST,
    actionREST,
    customREST,
  };
}
