import { Agent } from "@/model/agent";
import { Network, NetworkEdge, NetworkNode } from "../Network";
import { Sequential } from "@/model/types";

type NetworkEventType =
  | "addagent"
  | "removeagent"
  | "addnode"
  | "removenode"
  | "addedge"
  | "removeedge"
  | "agententer"
  | "agentexit"
  | "agentcross";

export interface NetworkEvent {
  id?: number;
  type: NetworkEventType;
  agent?: Agent;
  node?: NetworkNode;
  edge?: NetworkEdge;
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

export interface AddAgentEvent extends NetworkAgentEvent {
  type: "addagent";
}

export function isAddAgent(event: NetworkEvent): event is AddAgentEvent {
  return isAboutAgent(event) && event.type === "addagent";
}

export interface RemoveAgentEvent extends NetworkAgentEvent {
  type: "removeagent";
}

export function isRemoveAgent(event: NetworkEvent): event is RemoveAgentEvent {
  return isAboutAgent(event) && event.type === "removeagent";
}

export interface NetworkEdgeEvent extends NetworkEvent {
  edge: NetworkEdge;
}

export function isAboutEdge(event: NetworkEvent): event is NetworkEdgeEvent {
  return event.edge !== undefined;
}

export interface AddEdgeEvent extends NetworkEdgeEvent {
  type: "addedge";
}

export function isAddEdge(event: NetworkEvent): event is NetworkEdgeEvent {
  return isAboutEdge(event) && event.type === "addedge";
}

export interface RemoveEdgeEvent extends NetworkEdgeEvent {
  type: "removeedge";
}

export function isRemoveEdge(event: NetworkEvent): event is NetworkEdgeEvent {
  return isAboutEdge(event) && event.type === "removeedge";
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

export interface AgentEnterEvent extends NetworkEvent {
  type: "agententer";
  node: NetworkNode;
  agent: Agent;
}

export interface AgentExitEvent extends NetworkEvent {
  type: "agentexit";
  node: NetworkNode;
  agent: Agent;
}

export interface AgentCrossEvent extends NetworkEvent {
  type: "agentcross";
  agent: Agent;
  edge: NetworkEdge;
}
