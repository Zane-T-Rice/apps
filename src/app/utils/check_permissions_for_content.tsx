"use server";

import { ReactNode } from "react";
import { getServers } from "./server-manager-service/server-manager-service";
import { redirect as nextRedirect } from "next/navigation";
import { cookies as nextCookies } from "next/headers";

async function checkPermissions(requiredPermissions: string[]) {
  const permissions: string[] = [];

  if (requiredPermissions.includes("logged-in")) {
    const cookies = await nextCookies();
    const [username, password] = [
      cookies.get("username"),
      cookies.get("password"),
    ];
    if (username && password) permissions.push("logged-in");
  }

  if (requiredPermissions.includes("server-manager-service")) {
    const servers = await getServers();
    if (servers !== null) {
      permissions.push("server-manager-service");
    }
  }

  return requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );
}

export default async function CheckPermissionsForContent(props: {
  children: ReactNode;
  requiredPermissions: string[];
  redirect?: string;
}) {
  const { children, requiredPermissions, redirect } = props;
  const hasPermissions = await checkPermissions(requiredPermissions);

  if (!hasPermissions && redirect) nextRedirect(redirect);
  return hasPermissions ? <>{children}</> : null;
}
