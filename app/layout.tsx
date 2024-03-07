import React from "react";
import { Theme } from "@radix-ui/themes";

import "./globals.css";
import "@radix-ui/themes/styles.css";

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
      {/* suppress warning because radix theme appearance affects the <html> element */}
      <body>
        <Theme appearance="dark" accentColor="jade" radius="medium" >
          {children}
        </Theme>
      </body>
    </html>
  );
}
