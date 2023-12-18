import React, { ReactNode } from "react";
import { Network } from "@/model/network";

export type NetworkMonitorControlProps = {
  children: ReactNode;
  network: Network;
  action: (network: Network) => void;
};

export default function NetworkMonitorControl({ children, network, action }: NetworkMonitorControlProps) {
  return (
    <button className="rounded border-1" onClick={() => action(network)}>
      {children}
    </button>
  );
}


