import React, { CSSProperties }  from "react";

import NextLink from "next/link";
import { ClockIcon, MagicWandIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Tooltip } from "@radix-ui/themes";

import NavSidebar from "@/components/ui/NavSidebar";

export default function Datafield() {
  const style = {
    position: "absolute",
    top: "0px",
    left: "0px",
    height: "100vh",
    width: "100vw",
    zIndex: -99
  } satisfies CSSProperties;

  return (
    <NavSidebar>
      <Tooltip delayDuration={0} content="restart" side="right">
        <NextLink href="#yolo">
          <IconButton variant="soft">
            <ReloadIcon />
          </IconButton>
        </NextLink>
      </Tooltip>
      <Tooltip
        delayDuration={0}
        content="event log"
        side="right">
        <NextLink href="#events">
          <IconButton variant="soft">
            <ClockIcon />
          </IconButton>
        </NextLink>
      </Tooltip>
      <Tooltip
        delayDuration={0}
        content="agent editor"
        side="right">
        <NextLink href="#yolo">
          <IconButton variant="soft">
            <MagicWandIcon />
          </IconButton>
        </NextLink>
      </Tooltip>
    </NavSidebar>
  );
}


