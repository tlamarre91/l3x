import React, { CSSProperties, PropsWithChildren, useCallback, useMemo, useState }  from "react";
import Flex from "../ui/Flex";
import { AgentStatePanel } from "./AgentStatePanel";
import SolutionManager from "./SolutionManager";
import Panel from "../ui/Panel";

export type EditorPanelDockOption = "left" | "right" | "float" | "maximize";

export interface EditorPanelProps {
  dock?: EditorPanelDockOption;
}

export default function EditorPanel({
  dock = "left",
}: EditorPanelProps) {
  const style = {
    overflow: "scroll",
    pointerEvents: "auto",
  } satisfies CSSProperties;

  return (
    <Panel p="0" width="34rem" style={style}>
      <Flex flexDirection="column" width="100%">
        <SolutionManager />
        <AgentStatePanel />
      </Flex>
    </Panel>
  );
}
