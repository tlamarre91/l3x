"use client";
// TODO: rename -> GameWindow

import React, { useContext, useEffect } from "react";
// import { Flex } from "@radix-ui/themes";

import Header from "@/components/Header";
import Datafield from "@/components/datafield/Datafield";
import { GameContext, GameContextValue } from "./GameContext";
import GameUi from "./GameUi";
import Flex from "../ui/Flex";
import { NetworkFactory } from "@/model/network/NetworkFactory";
import Box from "../ui/Box";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "l3xnm",
  description: "",
};

export function setupDemo(gameContextData: GameContextValue) {
  const network = NetworkFactory.demo();
  gameContextData.game.setActiveNetwork(network);
  // const network = gameContextData.game.getNetworkView()?.network!;
  // const agent = network.getAgents()[0];
  // gameContextData.selectObject(agent);

}

export default function GameLayout() {
  const gameContextData = useContext(GameContext);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setupDemo(gameContextData);
  }, []);

  return (
    <GameContext.Provider value={gameContextData}>
      <Datafield/>
      <GameUi/>
    </GameContext.Provider>
  );
}

