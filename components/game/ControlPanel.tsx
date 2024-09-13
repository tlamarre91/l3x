import React, { CSSProperties, PropsWithChildren, useCallback, useMemo, useState }  from "react";
import Flex from "../ui/Flex";
import { AgentStatePanel } from "./AgentStatePanel";
import NetworkTestControls from "../network/NetworkTestControls";
import Panel from "../ui/Panel";

export type ControlPanelDockOption = "top" | "bottom" | "float" | "maximize" | "minimize";

export interface ControlPanelProps {
  dock?: ControlPanelDockOption;
}

export default function ControlPanel({
  children,
  dock = "bottom",
}: PropsWithChildren<ControlPanelProps>) {
  const style = {
    height: "fit-content",
    pointerEvents: "auto"
  } satisfies CSSProperties;

  return (
    <Panel>
      <Flex flexDirection="column" style={style}>
        this will contain
        * play/pause/step/revert controls
        * test case selection
        * level description
        * objective list and state
        <NetworkTestControls/>
      </Flex>
    </Panel>
  );
}

