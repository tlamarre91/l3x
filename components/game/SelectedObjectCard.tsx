import React, { useContext, useMemo } from "react";

import { GameContext } from "./GameContext";
import { useStateSubscription } from "@/hooks";
import AgentCard from "../agent/AgentCard";
import Panel from "../ui/Panel";

export default function SelectedObjectCard() {
  const gameContext = useContext(GameContext);

  const selectedObject = useStateSubscription(gameContext.selectedObject$, () => gameContext.getSelectedObject());

  const selectedObjectComponent = useMemo(() => {
    if (selectedObject == null) {
      return null;
    }

    if (selectedObject.isAgent()) {
      // return <AgentCard agent={selectedObject} />;
      return <Panel>TODO: handle selected agent</Panel>;
    }

    if (selectedObject.type === "edge") {
      return <Panel>
        <div>
          {selectedObject.name}
        </div>
        <div>
          {selectedObject.key}
        </div>
      </Panel>;
    }

    console.log(`selected ${selectedObject.name}`);
    return (
      <Panel>
        {selectedObject.name}
      </Panel>
    );
  }, [selectedObject]);

  return (
    selectedObjectComponent
  );
}


