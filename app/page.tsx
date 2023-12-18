import React from "react";

// import { createClient } from "@/utils/supabase/server";
// import { cookies } from "next/headers";

// import AuthButton from "@/components/AuthButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import { Network } from "@/model/network";
import NetworkSandbox from "@/components/network/NetworkSandbox";

export default async function Index() {
  // const cookieStore = cookies();

  // const canInitSupabaseClient = () => {
  //   // This function is just for the interactive tutorial.
  //   // Feel free to remove it once you have Supabase connected.
  //   try {
  //     createClient(cookieStore);
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // };
  //
  // const isSupabaseConnected = canInitSupabaseClient();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <Header />
      <NetworkSandbox />
      <Footer />
    </div>
  );
}
