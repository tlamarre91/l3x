import { Agent } from "@/model/agent";
import { Network, NetworkEdgeSpec, NetworkNode } from "../Network";

type NetworkEventType = "addagent" | "removeagent" | "addnode" | "removenode" | "addedge" | "removeedge";

export class NetworkEvent {
  type: NetworkEventType | undefined;
  network: Network;

  constructor(network: Network) {
    this.network = network;
  }
}

export function isAddAgent(event: NetworkEvent): event is NetworkAddAgentEvent {
  return event.type === "addagent";
}

export function isRemoveAgent(event: NetworkEvent): event is NetworkRemoveAgentEvent {
  return event.type === "removeagent";
}

export function isAddNode(event: NetworkEvent): event is NetworkAddNodeEvent {
  return event.type === "addnode";
}

export function isRemoveNode(event: NetworkEvent): event is NetworkRemoveNodeEvent {
  return event.type === "removenode";
}

export class NetworkAddAgentEvent extends NetworkEvent {
  type = "addagent" as const;
  agent: Agent;

  constructor(network: Network, agent: Agent) {
    super(network);
    this.agent = agent;
  }
}

export class NetworkRemoveAgentEvent extends NetworkEvent {
  type = "removeagent" as const;
  agent: Agent;

  constructor(network: Network, agent: Agent) {
    super(network);
    this.agent = agent;
  }
}

export class NetworkAddNodeEvent extends NetworkEvent {
  type = "addnode" as const;
  node: NetworkNode;

  constructor(network: Network, node: NetworkNode) {
    super(network);
    this.node = node;
  }
}

export class NetworkRemoveNodeEvent extends NetworkEvent {
  type = "removenode" as const;
  node: NetworkNode;

  constructor(network: Network, node: NetworkNode) {
    super(network);
    this.node = node;
  }
}

export class NetworkAddEdgeEvent extends NetworkEvent {
  type = "addedge" as const;
  edgeSpec: NetworkEdgeSpec;

  constructor(network: Network, edgeSpec: NetworkEdgeSpec) {
    super(network);
    this.edgeSpec = edgeSpec;
  }
}

export class NetworkRemoveEdgeEvent extends NetworkEvent {
  type = "removeedge" as const;
  edgeSpec: NetworkEdgeSpec;

  constructor(network: Network, edgeSpec: NetworkEdgeSpec) {
    super(network);
    this.edgeSpec = edgeSpec;
  }
}
