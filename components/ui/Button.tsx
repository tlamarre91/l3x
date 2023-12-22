import React, { ReactNode } from "react";
import { Button } from "@radix-ui/themes";

export type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  size?: "s" | "m" | "l";
};

export default function _Button({ children, onClick, size = "m" }: ButtonProps) {
  return (
    <Button variant="soft" onClick={onClick}>
      {children}
    </Button>
  );
}

