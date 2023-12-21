"use server";

import React from "react";

import Footer from "@/components/Footer";
import NetworkSandbox from "@/components/network/NetworkSandbox";
import AuthHeader from "@/components/AuthHeader";

export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col">
      <AuthHeader />
      <NetworkSandbox />
      <Footer />
    </div>
  );
}
