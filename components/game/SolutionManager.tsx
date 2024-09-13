import React, { CSSProperties, PropsWithChildren, useCallback, useMemo, useState }  from "react";
import Flex from "../ui/Flex";
import Panel from "../ui/Panel";


export interface SolutionManagerProps {
}

export default function SolutionManager({
}: SolutionManagerProps) {
  const style = {
    // overflow: "scroll",
    // pointerEvents: "auto",
  } satisfies CSSProperties;

  return (
    <Panel>
      <Flex flexDirection="row" style={style}>
        solution manager
      </Flex>
    </Panel>
  );
}

