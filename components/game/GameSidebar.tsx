import React, { CSSProperties, useCallback, useMemo, useState }  from "react";

import NextLink from "next/link";
import { ClockIcon, CubeIcon, MagicWandIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Tooltip } from "@radix-ui/themes";

import NavSidebar from "@/components/ui/NavSidebar";
import NetworkNodeList from "../network/NetworkNodeList";
import NetworkObjectTree from "../network/NetworkObjectTree";

export type SidebarName = "explore" | "test" | "help";

export function ExploreSidebar() {
  return (
    <Box style={{ height: "100vh" }}>
      <NetworkObjectTree />
    </Box>
  );
}

export default function GameSidebar() {
  const [activeSidebar, setActiveSidebar] = useState<SidebarName | null>(null);

  const setOrDeactivateSidebar = useCallback((sidebarName: SidebarName) => {
    setActiveSidebar((active) => {
      if (active === sidebarName) {
        return null;
      }

      return sidebarName;
    });
  }, []);

  const sidebarComponent = useMemo(() => {
    switch (activeSidebar) {
      case null:
        return null

      case "explore":
        return <ExploreSidebar />;

      default:
        return <div>TODO: {activeSidebar}</div>;
    }
  }, [activeSidebar]);

  return (
    <>
      {sidebarComponent}
      <NavSidebar>
        <Tooltip delayDuration={0} content="explore" side="right">
          <IconButton variant="soft" onClick={() => setOrDeactivateSidebar("explore")}>
            <CubeIcon />
          </IconButton>
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
    </>
  );
}


