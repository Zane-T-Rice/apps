"use client";

import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";
import { Auth0Provider } from "@auth0/auth0-react";

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
            authorizationParams={{
              redirect_uri: `${process.env.NEXT_PUBLIC_WEBSITE_DOMAIN}/apps`,
              audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
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
