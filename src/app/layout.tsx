import { Provider } from "@/components/shared/provider";

export default function DashboardLayout({
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
