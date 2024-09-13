import React from "react";

import "./globals.scss";
// import "@radix-ui/themes/styles.css";
import Theme from "@/components/ui/Theme";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "l3x",
  description: "",
};

export default function RootLayout({
  children,
}: {
    children: React.ReactNode
  }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppress warning because theme alters the body element */}
      <body>
        <Theme appearance="nopref">
          {children}
        </Theme>
      </body>
    </html>
  );
}
