"use server";

import React from "react";

import Footer from "@/components/Footer";
import NetworkSandbox from "@/components/network/NetworkSandbox";
import { Flex } from "@radix-ui/themes";

export default async function Index() {
  return (
    <Flex direction="column" width="100%">
      <NetworkSandbox />
      <Footer />
    </Flex>
  );
}
