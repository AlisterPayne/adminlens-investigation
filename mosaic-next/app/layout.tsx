import "./css/style.css";

import AppProvider from "./app-provider";
import Theme from "./theme-provider";

export const metadata = {
  title: "Admin Lens — Workspace OAuth Governance",
  description: "OAuth Application Security and Governance for Google Workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-gray-50 text-gray-700 antialiased">
        <Theme>
          <AppProvider>{children}</AppProvider>
        </Theme>
      </body>
    </html>
  );
}
