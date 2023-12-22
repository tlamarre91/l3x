"use server";

import React from "react";

import Footer from "@/components/Footer";
import NetworkSandbox from "@/components/network/NetworkSandbox";
import { Flex } from "@radix-ui/themes";
import Header from "@/components/Header";

export default async function Index() {
  return (
    <Flex direction="column" width="100%">
      <Header />
      <NetworkSandbox />
      <Footer />
    </Flex>
  );
}
