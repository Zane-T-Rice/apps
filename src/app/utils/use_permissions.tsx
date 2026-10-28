import { useAuth0 } from "@auth0/auth0-react";
import { useGetAccessToken } from "./use_access_token";
import { jwtDecode } from "jwt-decode";

export function usePermissions() {
  const { isLoading, isAuthenticated } = useAuth0();
  const getAccessToken = useGetAccessToken();

  const hasPermissions = async (
    requiredPermissions: string[],
  ): Promise<boolean | null> => {
    if (isLoading) return null;

    const accessToken =
      !isLoading && isAuthenticated ? await getAccessToken() : "";
    const permissions = accessToken
      ? (jwtDecode(accessToken) as { scope: string }).scope.split(" ")
      : [];
    return requiredPermissions.every((requiredPermission) =>
      permissions.includes(requiredPermission),
    );
  };

  return { hasPermissions };
}
