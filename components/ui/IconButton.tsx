import React, { type MouseEventHandler, useContext, CSSProperties } from "react";
import { ThemeContext } from "./Theme";
import type { BoxProps, SizeValue } from "../types";
import { useBoxProps } from "@/hooks";
import Flex from "./Flex";

export interface IconButtonProps extends BoxProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  // size: SizeValue;
}

// TODO: make it so this could be an <a> instead of <button>
export default function IconButton({
  p = "2",
  ...otherProps
}: IconButtonProps & React.HTMLAttributes<HTMLDivElement>) {
  const [style, iconButtonProps] = useBoxProps({ p, ...otherProps });

  const {
    onClick,
    children,
    ...divProps
  } = iconButtonProps;

  return (
    <button className="icon" onClick={onClick}>
      <Flex
        align="center"
        justify="center"
        style={style}
        {...divProps}
      >
        {children}
      </Flex>
    </button>
  );
}


