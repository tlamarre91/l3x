import React, { ReactNode } from "react";
import { Button as RadixButton } from "@radix-ui/themes";

export type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  size?: "s" | "m" | "l";
};

export default function Button({ children, onClick, size: _size = "m" }: ButtonProps) {
  return (
    <RadixButton variant="soft" onClick={onClick}>
      {children}
    </RadixButton>
  );
}

