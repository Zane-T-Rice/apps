"use server";

import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main>
          <Provider>
            <Toaster />
            {children}
          </Provider>
        </main>
      </body>
    </html>
  );
}
