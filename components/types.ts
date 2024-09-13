import { CSSProperties, PropsWithChildren } from "react";

export interface BoxProps {
  style?: CSSProperties;
  /** padding */
  p?: SizeValue;
  /** margin */
  m?: SizeValue;
  /** border-radius */
  r?: SizeValue;
  backgroundColor?: string;
  width?: string;
}

export type SizeValue = 
  | "0"
  | "1"
  | "2" 
  | "3" 
  | "4"
  | "5";
