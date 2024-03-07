import React, { useContext, useMemo } from "react";
import { Box, Card, Flex, IconButton, Tooltip } from "@radix-ui/themes";

import Header from "@/components/Header";
import NetworkTestControls from "@/components/network/NetworkTestControls";
import Datafield from "@/components/datafield/Datafield";
import GameSidebar from "./GameSidebar";
import { GameContext, makeGameContextData } from "./GameContext";
import { useStateSubscription } from "@/hooks";
import AgentCard from "../agent/AgentCard";


const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "l3x",
  description: "",
};

export default function SelectedObjectCard({ children }: {
  children?: React.ReactNode
}) {
  // const gameContextData = makeGameContextData();
  const gameContext = useContext(GameContext);

  const selectedObject = useStateSubscription(gameContext.selectedObject$, gameContext.getSelectedObject());

  const selectedObjectComponent = useMemo(() => {
    if (selectedObject == null) {
      return null;
    }

    if (selectedObject.type === "agent") {
      return <AgentCard agent={selectedObject} />;
    }

    return (
      <Card>
        {selectedObject.name}
      </Card>
    );
  }, [selectedObject]);

  return (
    selectedObjectComponent
  );
}


