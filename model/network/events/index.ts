import { Agent } from "@/model/agent";
import { Network, NetworkEdgeSpec, NetworkNode } from "../Network";
import { Sequential } from "@/model/types";

type NetworkEventType = "addagent" | "removeagent" | "addnode" | "removenode" | "addedge" | "removeedge" | "agententer" | "agentexit";

// TODO: there probably shouldn't be an "Emittable" type limited to concrete events like NetworkAddAgentEvent... right?
export interface NetworkEvent {
  id?: number;
  type: NetworkEventType;
  network: Network;
  agent?: Agent;
  node?: NetworkNode;
  edgeSpec?: NetworkEdgeSpec;
}

export interface SequentialNetworkEvent {
  id: number;
}

export function isSequential<T extends NetworkEvent>(event: T): event is Sequential & T {
  return event.id !== undefined;
}

export interface NetworkAgentEvent extends NetworkEvent {
  agent: Agent;
}

export function isAboutAgent(event: NetworkEvent): event is NetworkAgentEvent {
  return event.agent !== undefined;
}

export interface NetworkAddAgentEvent extends NetworkAgentEvent {
  type: "addagent";
}

export function isAddAgent(event: NetworkEvent): event is NetworkAddAgentEvent {
  return isAboutAgent(event) && event.type === "addagent";
}

export interface NetworkRemoveAgentEvent extends NetworkAgentEvent {
  type: "removeagent";
}

export function isRemoveAgent(event: NetworkEvent): event is NetworkRemoveAgentEvent {
  return isAboutAgent(event) && event.type === "removeagent";
}

export interface NetworkEdgeEvent extends NetworkEvent {
  edgeSpec: NetworkEdgeSpec;
}

export function isAboutEdge(event: NetworkEvent): event is NetworkEdgeEvent {
  return event.edgeSpec !== undefined;
}

export interface NetworkNodeEvent extends NetworkEvent {
  node: NetworkNode;
}

export function isAboutNode(event: NetworkEvent): event is NetworkNodeEvent {
  return event.node !== undefined;
}

export interface NetworkAddNodeEvent extends NetworkNodeEvent {
  type: "addnode";
}

export function isAddNode(event: NetworkEvent): event is NetworkAddNodeEvent {
  return isAboutNode(event) && event.type === "addnode";
}

export interface NetworkRemoveNodeEvent extends NetworkNodeEvent {
  type: "removenode";
}

export function isRemoveNode(event: NetworkEvent): event is NetworkAddNodeEvent {
  return isAboutNode(event) && event.type === "removenode";
}

// export class NetworkEvent {
//   type: NetworkEventType | undefined;
//   network: Network;
//
//   constructor(network: Network) {
//     this.network = network;
//   }
//
//   serialize() {
//     return { type: this.type, network: this.network.name };
//   }
// }
//
// export type SequentialNetworkEvent = Sequential & NetworkEvent;
//
// export function isAddAgent(event: NetworkEvent): event is NetworkAddAgentEvent {
//   return event.type === "addagent";
// }
//
// export function isRemoveAgent(event: NetworkEvent): event is NetworkRemoveAgentEvent {
//   return event.type === "removeagent";
// }
//
// // TODO: this name doesn't really make sense if we have agententer and agentexit considered node events
// export function isAboutAgent(event: NetworkEvent): event is NetworkAgentEvent {
//   return isAddAgent(event) || isRemoveAgent(event);
// }
//
// export function isAddNode(event: NetworkEvent): event is NetworkAddNodeEvent {
//   return event.type === "addnode";
// }
//
// export function isRemoveNode(event: NetworkEvent): event is NetworkRemoveNodeEvent {
//   return event.type === "removenode";
// }
//
// export function isAgentEnter(event: NetworkEvent): event is AgentEnterNodeEvent {
//   return event.type === "agententer";
// }
//
// export function isAgentExit(event: NetworkEvent): event is AgentExitNodeEvent {
//   return event.type === "agentexit";
// }
//
// export function isAboutNode(event: NetworkEvent): event is NetworkNodeEvent {
//   return isAddNode(event) || isRemoveNode(event) || isAgentEnter(event) || isAgentExit(event);
// }
//
// export class NetworkAgentEvent extends NetworkEvent {
//   agent: Agent;
//
//   constructor(network: Network, agent: Agent) {
//     super(network);
//     this.agent = agent;
//   }
//
//   serialize() {
//     return { type: this.type, network: this.network.name, agent: this.agent.name };
//   }
// }
//
// export class NetworkAddAgentEvent extends NetworkAgentEvent {
//   type = "addagent" as const;
// }
//
// export class NetworkRemoveAgentEvent extends NetworkAgentEvent {
//   type = "removeagent" as const;
// }
//
// export class NetworkNodeEvent extends NetworkEvent {
//   node: NetworkNode;
//
//   constructor(network: Network, node: NetworkNode) {
//     super(network);
//     this.node = node;
//   }
// }
//
// export class NetworkAddNodeEvent extends NetworkNodeEvent {
//   type = "addnode" as const;
// }
//
// export class NetworkRemoveNodeEvent extends NetworkNodeEvent {
//   type = "removenode" as const;
// }
//
// export class AgentEnterNodeEvent extends NetworkNodeEvent {
//   type = "agententer" as const;
//   agent: Agent;
//
//   constructor(network: Network, node: NetworkNode, agent: Agent) {
//     super(network, node);
//     this.agent = agent;
//   }
// }
//
// export class AgentExitNodeEvent extends NetworkNodeEvent {
//   type = "agentexit" as const;
//   agent: Agent;
//
//   constructor(network: Network, node: NetworkNode, agent: Agent) {
//     super(network, node);
//     this.agent = agent;
//   }
// }
//
// export class NetworkAddEdgeEvent extends NetworkEvent {
//   type = "addedge" as const;
//   edgeSpec: NetworkEdgeSpec;
//
//   constructor(network: Network, edgeSpec: NetworkEdgeSpec) {
//     super(network);
//     this.edgeSpec = edgeSpec;
//   }
// }
//
// export class NetworkRemoveEdgeEvent extends NetworkEvent {
//   type = "removeedge" as const;
//   edgeSpec: NetworkEdgeSpec;
//
//   constructor(network: Network, edgeSpec: NetworkEdgeSpec) {
//     super(network);
//     this.edgeSpec = edgeSpec;
//   }
// }
