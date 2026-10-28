"use client";

import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { Auth0Provider } from "@auth0/auth0-react";

// On localhost, Auth0's silent login does not restore the login after a refresh, which would
// otherwise mean logging in again every time. Keep the login in localStorage there. Everywhere
// else the tokens stay in memory only.
const cacheLocation = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN?.startsWith(
  "http://localhost",
)
  ? "localstorage"
  : "memory";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main>
          <Auth0Provider
            domain={`${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`}
            clientId={`${process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}`}
            cacheLocation={cacheLocation}
            onRedirectCallback={(appState) => {
              // Back to where a re-login was needed. Without one, stay on the page the login returned to.
              if (appState?.returnTo)
                window.location.replace(appState.returnTo);
              else
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname,
                );
            }}
            authorizationParams={{
              redirect_uri: `${process.env.NEXT_PUBLIC_WEBSITE_DOMAIN}/apps`,
              audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
              scope: process.env.NEXT_PUBLIC_AUTH0_SCOPES,
            }}
          >
            <Provider>
              <Toaster />
              {children}
            </Provider>
          </Auth0Provider>
        </main>
      </body>
    </html>
  );
}
