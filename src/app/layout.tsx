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
            domain="dev-7n448ak2gn3oqctx.us.auth0.com"
            clientId="9gbYkOK0QacEul9QHfidMwhRurXbnPS1"
            authorizationParams={{
              redirect_uri: `${process.env.NEXT_PUBLIC_WEBSITE_DOMAIN}/apps`,
              audience: process.env.NEXT_PUBLIC_SERVER_MANAGER_SERVICE_DOMAIN,
              scope: "read:servers write:servers reboot:servers update:servers",
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
