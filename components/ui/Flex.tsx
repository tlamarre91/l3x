import React, { CSSProperties } from "react";
import { BoxProps, SizeValue } from "@/components/types";
import Box from "./Box";
import { useBoxProps } from "@/hooks";

export interface FlexProps extends BoxProps {
  gap?: SizeValue;
  align?: "start" | "center" | "end" | "space-between";
  alignItems?: "start" | "center" | "end" | "space-between";
  flexDirection?: "column" | "row";
  justify?: "start" | "center" | "end" | "space-between";
}

export default function Flex(props: FlexProps & React.HTMLAttributes<HTMLDivElement>) {
  let [style, flexProps] = useBoxProps(props);

  const {
    flexDirection,
    justify,
    align,
    alignItems,
    gap: gapSize,
    ...restProps
  } = flexProps;

  const gap = gapSize === "1"
    ? "var(--length-sm)"
    : gapSize === "2"
      ? "var(--length-md)"
      : gapSize === "3"
        ? "var(--length-lg)"
        : gapSize === "4"
          ? "var(--length-xl)"
          : undefined;

  style = {
    ...style,
    display: "flex",
    flexDirection: flexDirection ?? "row",
    justifyContent: justify,
    alignContent: align,
    alignItems,
    gap
  };

  return (
    <Box style={style} {...restProps} />
  );
}
