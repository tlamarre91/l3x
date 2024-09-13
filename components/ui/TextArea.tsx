import React, { type ForwardedRef, type PropsWithRef, forwardRef, useContext } from "react";
import { BoxProps, SizeValue } from "@/components/types";
import { ThemeContext } from "./Theme";
import { useBoxProps } from "@/hooks";
import Box from "./Box";

export interface TextAreaProps extends PropsWithRef<BoxProps> {
  size: SizeValue;
}

const TextArea = forwardRef(
  function TextArea(
    props: TextAreaProps & React.HTMLAttributes<HTMLTextAreaElement>,
    ref: ForwardedRef<HTMLTextAreaElement>
  ) {
    const [style, otherProps] = useBoxProps(props);

    const {
      size,
      ...textAreaProps
    } = otherProps;

    return (
      <Box style={style}>
        <textarea {...textAreaProps} ref={ref} />
      </Box>
    );
  }
);

export default TextArea;
