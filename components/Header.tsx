import React from "react";
import AuthHeader from "./AuthHeader";
import { Flex, Heading } from "@radix-ui/themes";

export default function Header() {
  return (
    <nav>
      <Flex gap="3" m="1">
        <Heading>tewnas</Heading>
      </Flex>
    </nav>
  );
}
