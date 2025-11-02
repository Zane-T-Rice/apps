import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";

export function usePermissions() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const hasPermissions = async (
    requiredPermissions: string[]
  ): Promise<boolean | null> => {
    if (isLoading) return null;

    const accessToken =
      !isLoading && isAuthenticated ? await getAccessTokenSilently() : "";
    const permissions = accessToken
      ? (jwtDecode(accessToken) as { scope: string }).scope.split(' ')
      : [];
    return requiredPermissions.every((requiredPermission) =>
      permissions.includes(requiredPermission)
    );
  };

  return { hasPermissions };
}
