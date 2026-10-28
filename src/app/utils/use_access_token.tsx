import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

// Auth0 answers with these when the token can no longer be renewed in the background, i.e. an
// expired login, or on localhost where it can never skip the consent prompt. Only a visit to the
// login page can fix them.
const NEEDS_LOGIN = [
  "login_required",
  "consent_required",
  "interaction_required",
  "missing_refresh_token",
];

// Just after being sent to log in, do not send them again. Otherwise a login that keeps failing
// would bounce back and forth forever.
const RELOGIN_STORAGE_KEY = "auth0-relogin-at";
const RELOGIN_COOLDOWN_MS = 60000;

function recentlySentToLogin(): boolean {
  try {
    const at = Number(sessionStorage.getItem(RELOGIN_STORAGE_KEY));
    return Date.now() - at < RELOGIN_COOLDOWN_MS;
  } catch {
    return false;
  }
}

// Like getAccessTokenSilently, but a login that needs the user sends them to log in again and
// brings them back to this page, instead of failing.
export function useGetAccessToken() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  return useCallback(async (): Promise<string> => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      const code = (error as { error?: string } | null)?.error;
      if (!code || !NEEDS_LOGIN.includes(code) || recentlySentToLogin())
        throw error;
      try {
        sessionStorage.setItem(RELOGIN_STORAGE_KEY, `${Date.now()}`);
      } catch {}
      await loginWithRedirect({
        appState: {
          returnTo: `${window.location.pathname}${window.location.search}`,
        },
      });
      // The page is leaving. Never answer, so nothing carries on without a token.
      return new Promise<string>(() => {});
    }
  }, [getAccessTokenSilently, loginWithRedirect]);
}
