import React, { PropsWithChildren, useContext } from "react";
import { BoxProps } from "@/components/types";
import { ThemeContext } from "./Theme";
import { useBoxProps } from "@/hooks";
import Flex from "./Flex";

export interface PanelProps extends PropsWithChildren<BoxProps> {
  borderColor?: string;
  // fullWidth
}

export default function Panel(props: PanelProps & React.HTMLAttributes<HTMLDivElement>) {
  const theme = useContext(ThemeContext);
  let [style, panelProps] = useBoxProps(props);

  const {
    borderColor,
    className,
    children,
    ...divProps
  } = panelProps;

  style = {
    ...style,
    borderColor
  };

  const panelClassName = className ? `panel ${className}` : "panel";

  return (
    <Flex className={panelClassName} style={style}>
      {children}
    </Flex>
    // <div className={`panel ${className}`} style={style} {...divProps} />
  );
}


