"use server";

import React from "react";

// import { createClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers";

import AuthButton from "./AuthButton";
import { Flex } from "@radix-ui/themes";

export default async function AuthHeader() {
  // const cookieStore = cookies();

  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      // createClient(cookieStore);
      // return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <Flex>
      {isSupabaseConnected && <AuthButton />}
    </Flex>
  );
}
