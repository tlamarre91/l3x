"use client";

import React, { useContext } from "react";
import { Box, Flex, IconButton, Tooltip } from "@radix-ui/themes";

import Header from "@/components/Header";
import NetworkTestControls from "@/components/network/NetworkTestControls";
import NetworkMonitor from "@/components/network/NetworkMonitor";
import Datafield from "@/components/datafield/Datafield";
import GameSidebar from "./GameSidebar";
import { GameContext, makeGameContextData } from "./GameContext";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "tewnas",
  description: "",
};

export default function GameLayout({ children }: {
  children?: React.ReactNode
}) {
  // const gameContextData = makeGameContextData();
  const gameContextData = useContext(GameContext);

  return (
    <GameContext.Provider value={gameContextData}>
      <Box p="2">
        <Header />
        <Flex width="100%">
          <GameSidebar />
          <Box width="100%">
            <Flex direction="column" p="2" m="2" gap="2" >
              <NetworkTestControls />
              <Datafield />
              <NetworkMonitor />
            </Flex>
          </Box>
        </Flex>
      </Box>
    </GameContext.Provider>
  );
}

