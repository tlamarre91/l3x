import React, { CSSProperties, useCallback, useMemo, useState }  from "react";

export default function ViewportBox() {
  // TODO: this is gonna be the reserved area for viewing the network state
  // may also contain stuff that gets overlaid, like tooltips/names
  const style = {
    pointerEvents: "none",
    flexGrow: 1,
    // backgroundColor: "#e6000044" 
  } satisfies CSSProperties;


  // TODO: track center point and figure out how to get THREE to consider that the center of rotation

  return (
    <div style={style}>
    </div>
  );
}
