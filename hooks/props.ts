import { BoxProps } from "@/components/types";
import { sizeToPx } from "@/utils";
import { CSSProperties, useMemo } from "react";

/**
 * Take the BoxProps out of T, return a CSSProperties and the rest of
 * the props from T
 */
export function useBoxProps<T extends BoxProps>(
  boxProps: T
): [CSSProperties, Omit<T, keyof BoxProps>] {
  let {
    p,
    m,
    r,
    backgroundColor,
    width,
    style,
    ...otherProps
  } = boxProps;

  const padding = useMemo(() => p ? sizeToPx(p) : undefined, [p]);
  const margin = useMemo(() => m ? sizeToPx(m) : undefined, [m]);
  const borderRadius = useMemo(() => r ? sizeToPx(r) : undefined, [r]);

  style = {
    padding,
    margin,
    borderRadius,
    backgroundColor,
    width,
    ...style,
  };

  // TODO: someday find out why the type of otherProps isn't good enough
  return [style, otherProps as Omit<T, keyof BoxProps>];
}

