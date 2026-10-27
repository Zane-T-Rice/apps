"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useRef, useState } from "react";

// What the status light shows for an app.
//   available:   the service answered its health check.
//   unavailable: it could not be reached, or it answered that it is unwell.
//   unknown:     we could not tell (i.e. no token, or it refused the one we have).
export type AppHealth = "checking" | "available" | "unavailable" | "unknown";

const TIMEOUT_MS = 10000;

// Two cards can use the same service. Let them share one request instead of asking twice.
const inFlight = new Map<string, Promise<AppHealth>>();

async function askHealth(url: string, accessToken: string): Promise<AppHealth> {
  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.ok) return "available";
    // The service answered, so it is up, but it would not say whether it is well.
    if (response.status === 401 || response.status === 403) return "unknown";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

// Asks a service's /health on load and whenever refresh is called. The service needs a valid token
// like any other route, which the signed in user already has.
export function useAppHealth(healthUrl: string) {
  const { getAccessTokenSilently } = useAuth0();
  const [health, setHealth] = useState<AppHealth>("checking");
  // Keep the latest token function without making refresh change when it does, which would ask again.
  const latestGetAccessToken = useRef(getAccessTokenSilently);
  useEffect(() => {
    latestGetAccessToken.current = getAccessTokenSilently;
  });
  const isMounted = useRef<boolean>(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Asks and shows the answer. It starts from whatever is showing, which is "checking" on load.
  const check = useCallback(async () => {
    let result: AppHealth;
    try {
      const accessToken = await latestGetAccessToken.current();
      // Some versions of the Auth0 library can answer with nothing instead of throwing.
      if (!accessToken) throw new Error("There is no access token.");
      let pending = inFlight.get(healthUrl);
      if (!pending) {
        pending = askHealth(healthUrl, accessToken).finally(() =>
          inFlight.delete(healthUrl),
        );
        inFlight.set(healthUrl, pending);
      }
      result = await pending;
    } catch {
      // Without a token we cannot ask, which says nothing about the service.
      result = "unknown";
    }
    if (isMounted.current) setHealth(result);
  }, [healthUrl]);

  // Asks again, showing "checking" meanwhile.
  const refresh = useCallback(() => {
    setHealth("checking");
    return check();
  }, [check]);

  useEffect(() => {
    check();
  }, [check]);

  return { health, refresh };
}
