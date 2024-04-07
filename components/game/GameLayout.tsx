"use client";

import React, { useContext } from "react";
import { Box, Flex } from "@radix-ui/themes";

import Header from "@/components/Header";
import NetworkTestControls from "@/components/network/NetworkTestControls";
import Datafield from "@/components/datafield/Datafield";
import GameSidebar from "./GameSidebar";
import { GameContext } from "./GameContext";
import SelectedObjectCard from "./SelectedObjectCard";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "l3xnm",
  description: "",
};

export default function GameLayout() {
  const gameContextData = useContext(GameContext);

  return (
    <GameContext.Provider value={gameContextData}>
      <Flex p="2" gap="2">
        <GameSidebar />
        <Datafield />
        <Flex direction="column" width="100%" gap="2">
          <Header />
          <NetworkTestControls />
          <Box width="max-content">
            <SelectedObjectCard />
          </Box>
        </Flex>
      </Flex>
    </GameContext.Provider>
  );
}

