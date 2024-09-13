import React, { useContext } from "react";
import { BoxProps } from "@/components/types";
import { ThemeContext } from "./Theme";
import { useBoxProps } from "@/hooks";

export default function Box(props: BoxProps & React.HTMLAttributes<HTMLDivElement>) {
  const theme = useContext(ThemeContext);
  let [style, divProps] = useBoxProps(props);

  style = {
    ...style,
    ...props.style
  };

  return (
    <div style={style} {...divProps} />
  );
}

