import React, { useCallback, useMemo, useState }  from "react";

import NextLink from "next/link";
import { ClockIcon, CubeIcon, MagicWandIcon } from "@radix-ui/react-icons";
import Box from "../ui/Box";
import IconButton from "../ui/IconButton";

import NetworkObjectTree from "../network/NetworkObjectTree";
import Flex from "../ui/Flex";

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
        return null;

      case "explore":
        return <ExploreSidebar />;

      default:
        return <div>TODO: {activeSidebar}</div>;
    }
  }, [activeSidebar]);

  return (
    <>
      {sidebarComponent}
      <Flex flexDirection="column" gap="1">

        <IconButton onClick={() => setOrDeactivateSidebar("explore")}>
          <CubeIcon />
        </IconButton>


        <NextLink href="#events">
          <IconButton variant="soft">
            <ClockIcon />
          </IconButton>
        </NextLink>


        <NextLink href="#yolo">
          <IconButton variant="soft">
            <MagicWandIcon />
          </IconButton>
        </NextLink>

      </Flex>
    </>
  );
}


