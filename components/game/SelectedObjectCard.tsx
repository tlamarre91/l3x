import React, { useContext, useMemo } from "react";
import { Card } from "@radix-ui/themes";

import { GameContext } from "./GameContext";
import { useStateSubscription } from "@/hooks";
import AgentCard from "../agent/AgentCard";

export default function SelectedObjectCard() {
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


