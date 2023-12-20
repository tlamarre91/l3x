import React, { ReactNode } from "react";

export type NetworkMonitorControlProps = {
  children: ReactNode;
  onClick: () => void;
};

export default function NetworkMonitorControl({ children, onClick }: NetworkMonitorControlProps) {
  return (
    <button className="rounded-md border m-1" onClick={onClick}>
      {children}
    </button>
  );
}


