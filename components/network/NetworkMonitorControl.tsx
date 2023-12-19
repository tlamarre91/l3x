import React, { ReactNode } from "react";

export type NetworkMonitorControlProps = {
  children: ReactNode;
  action: () => void;
};

export default function NetworkMonitorControl({ children, action }: NetworkMonitorControlProps) {
  return (
    <button className="rounded-md border m-1" onClick={() => { console.log("doing it!"); action(); }}>
      {children}
    </button>
  );
}


