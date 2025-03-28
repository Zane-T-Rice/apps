"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { Server } from "./server-manager-service-servers";

export type EnvironmentVariable = {
  id: string;
  name: string;
  value: string;
};

export function useEnvironmentVariables() {
  const { getAccessTokenSilently } = useAuth0();

  async function getEnvironmentVariables(
    server: Server
  ): Promise<EnvironmentVariable[] | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/environmentVariables`,
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

  async function createEnvironmentVariable(
    server: Server,
    environmentVariable: Omit<EnvironmentVariable, "id">
  ): Promise<EnvironmentVariable | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/environmentVariables`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: accessToken,
        },
        body: JSON.stringify(environmentVariable),
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function editEnvironmentVariable(
    server: Server,
    environmentVariable: EnvironmentVariable
  ): Promise<EnvironmentVariable | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/environmentVariables/${environmentVariable.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: accessToken,
        },
        body: JSON.stringify(environmentVariable),
      }
    );

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  }

  async function deleteEnvironmentVariable(
    server: Server,
    environmentVariable: Pick<EnvironmentVariable, "id">
  ): Promise<EnvironmentVariable | null> {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN}/servers/${server.id}/environmentVariables/${environmentVariable.id}`,
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
    getEnvironmentVariables,
    createEnvironmentVariable,
    editEnvironmentVariable,
    deleteEnvironmentVariable,
  };
}
