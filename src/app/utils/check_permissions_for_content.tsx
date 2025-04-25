"use client";

import { ReactNode, useEffect, useState } from "react";
import { redirect as nextRedirect } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { usePermissions } from "./use_permissions";

export default function CheckPermissionsForContent(props: {
  children: ReactNode;
  requiredPermissions: string[];
  requiresOneOfPermissions?: string[];
  redirect?: string;
}) {
  const { children, requiredPermissions, requiresOneOfPermissions, redirect } =
    props;
  const { isLoading, isAuthenticated } = useAuth0();
  const { hasPermissions } = usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getHasPermission = async () => {
      if (isLoading) setHasPermission(null);
      const hasRequiredPermissions = await hasPermissions(requiredPermissions);
      const hasOneOfRequiredPermissions =
        requiresOneOfPermissions && requiresOneOfPermissions.length
          ? (
              await Promise.all(
                requiresOneOfPermissions.map(
                  async (permission) => await hasPermissions([permission])
                )
              )
            ).some((permission) => !!permission)
          : true;
      setHasPermission(!!hasRequiredPermissions && hasOneOfRequiredPermissions);
    };
    getHasPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  if (!isLoading && !hasPermission && hasPermission !== null && redirect)
    nextRedirect(redirect);
  return hasPermission ? <>{children}</> : null;
}
