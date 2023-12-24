import React, { ReactNode } from "react";
import { Flex } from "@radix-ui/themes";

export type NavSidebarProps = {
  children: ReactNode;
  onClick?: () => void;
  size?: "s" | "m" | "l";
};

export default function NavSidebar({ children, onClick, size: _size = "m" }: ButtonProps) {
  return (
    <nav>
      <Flex direction="column" gap="2">
        {children}
      </Flex>
    </nav>
  );
}


