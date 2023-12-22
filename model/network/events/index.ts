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

export interface SequentialNetworkEvent extends NetworkEvent {
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

// TODO: add/remove edge events

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
