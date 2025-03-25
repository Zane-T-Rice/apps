"use server";

import { Provider } from "@/components/ui/provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main>
          <Provider>{children}</Provider>
        </main>
      </body>
    </html>
  );
}
