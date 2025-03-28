"use client";

import { ReactNode, useEffect, useState } from "react";
import { redirect as nextRedirect } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { usePermissions } from "./use_permissions";

export default function CheckPermissionsForContent(props: {
  children: ReactNode;
  requiredPermissions: string[];
  redirect?: string;
}) {
  const { children, requiredPermissions, redirect } = props;
  const { isLoading, isAuthenticated } = useAuth0();
  const { hasPermissions } = usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getHasPermission = async () =>
      setHasPermission(await hasPermissions(requiredPermissions));
    getHasPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  if (!isLoading && !hasPermission && hasPermission !== null && redirect)
    nextRedirect(redirect);
  return hasPermission ? <>{children}</> : null;
}
