"use client";

export type Server = {
  id: string;
  applicationName: string;
  containerName: string;
  isInResponseChain: boolean;
  isUpdatable: boolean;
};

export async function getServers(
  accessToken: string
): Promise<Server[] | null> {
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

export async function createServer(
  accessToken: string,
  server: Omit<Server, "id">
): Promise<Server | null> {
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

export async function editServer(
  accessToken: string,
  server: Server
): Promise<Server | null> {
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

export async function deleteServer(
  accessToken: string,
  server: Pick<Server, "id">
): Promise<Server | null> {
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

export async function rebootServer(
  accessToken: string,
  server: Pick<Server, "id">
): Promise<Server | null> {
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

export async function updateServer(
  accessToken: string,
  server: Pick<Server, "id">
): Promise<Server | null> {
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
