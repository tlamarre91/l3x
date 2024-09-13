import React, { CSSProperties, useState }  from "react";
import NetworkTestControls from "../network/NetworkTestControls";
import Flex from "../ui/Flex";
import EditorPanel, { EditorPanelDockOption } from "./EditorPanel";
import ViewportBox from "./ViewportBox";
import ControlPanel, { ControlPanelDockOption } from "./ControlPanel";

export default function GameUi() {
  const [editorDock, setEditorDock] = useState<EditorPanelDockOption>("left");
  const [controlDock, setControlDock] = useState<ControlPanelDockOption>("bottom");

  const style = {
    // height: "100%",
    // width: "100%",
  } satisfies CSSProperties;

  // TODO: hey there should a debug flag that shows background colors on everything

  return (
    <Flex className="game-ui" flexDirection="row" style={style}>
      <EditorPanel dock={editorDock}/>
      <Flex flexDirection="column" style={{ pointerEvents: "none" }}>
        <ViewportBox/>
        <ControlPanel dock={controlDock}/>
      </Flex>
      { /* <SelectedObjectCard /> */ }
    </Flex>
  );
}


