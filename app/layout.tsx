import React from "react";
import { Box, Container, Flex, IconButton, Theme, Tooltip } from "@radix-ui/themes";

import "./globals.css";
import "@radix-ui/themes/styles.css";
import NavSidebar from "@/components/ui/NavSidebar";
import { ClockIcon, MagicWandIcon, ReloadIcon } from "@radix-ui/react-icons";
import Header from "@/components/Header";
import Link from "next/link";


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
    <html lang="en" suppressHydrationWarning>
      {/* suppress warning because radix theme appearance affects the <html> element */}
      <body>
        <Theme appearance="dark" accentColor="jade" radius="medium" >
          <Header />
          <Flex width="100%" gap="2">
            <NavSidebar>
              <Tooltip delayDuration={0} content="restart" side="right">
                <Link href="#yolo">
                  <IconButton variant="soft">
                    <ReloadIcon />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip
                delayDuration={0}
                content="event log"
                side="right">
                <Link href="#events">
                  <IconButton variant="soft">
                    <ClockIcon />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip
                delayDuration={0}
                content="agent editor"
                side="right">
                <Link href="#yolo">
                  <IconButton variant="soft">
                    <MagicWandIcon />
                  </IconButton>
                </Link>
              </Tooltip>
            </NavSidebar>
            <Box width="100%">
              <main>
                {children}
              </main>
            </Box>
          </Flex>
        </Theme>
      </body>
    </html>
  );
}
