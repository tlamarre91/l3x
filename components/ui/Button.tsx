import React, { CSSProperties, ReactNode } from "react";
import { BoxProps, SizeValue } from "../types";
import { useBoxProps } from "@/hooks";

export interface ButtonProps extends BoxProps {
  size?: SizeValue;
}

const softVariantStyle: CSSProperties = {

};

export default function Button(props: ButtonProps & React.HTMLAttributes<HTMLButtonElement>) {
  let [style, buttonProps] = useBoxProps(props);

  const {
    onClick,
    children,
    size,
  } = buttonProps;

  // TODO: fix this nonsense. i want that text centered!!!
  style = {
    ...style,
    // display: "table-cell",
  };

  const divStyle: CSSProperties = {
    verticalAlign: "middle",
    display: "table-cell",
  };

  return (
    <button style={style} onClick={onClick}>
      <div style={divStyle}>
        {children}
      </div>
    </button>
  );
}

