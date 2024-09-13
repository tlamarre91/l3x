import React from "react";
import { BoxProps } from "../types";
import { useBoxProps } from "@/hooks";

export interface HeadingProps extends BoxProps {
}

export default function Heading(props: HeadingProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const [style, headingProps] = useBoxProps(props);

  return (
    <h3 style={style} {...headingProps} />
  );
}

