import React from "react";
import { Flex, Theme } from "@radix-ui/themes";

import "./globals.css";
import "@radix-ui/themes/styles.css";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "tewnas",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppress warning because radix theme appearance affects the <html> element */}
      <body>
        <Theme appearance="dark" accentColor="jade" radius="medium" >
          <main>
            <Flex>
              {children}
            </Flex>
          </main>
        </Theme>
      </body>
    </html>
  );
}
