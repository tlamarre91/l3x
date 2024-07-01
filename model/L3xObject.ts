import { Agent } from "@/model/agent";
import { Network } from "@/model/network";
import { NetworkEdge } from "@/model/network/NetworkEdge";
import { NetworkNode } from "@/model/network/NetworkNode";

export type L3xObjectType =
  | "network"
  | "node"
  | "edge"
  | "agent";

export class L3xObject {
  constructor(
    public type: L3xObjectType,
    public name: string
  ) {
  }

  isNetwork(): this is Network {
    return this.type === "network";
  }

  isNode(): this is NetworkNode {
    return this.type === "node";
  }

  isEdge(): this is NetworkEdge {
    return this.type === "edge";
  }

  isAgent(): this is Agent {
    return this.type === "agent";
  }
}
