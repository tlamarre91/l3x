import { Agent } from "@/model/agent";
import { Sequential } from "@/model/types";
import { SequentialAgentEvent } from "@/model/agent/events";
import { NetworkEdge } from "../NetworkEdge";
import { NetworkNode } from "../NetworkNode";

type NetworkEventType =
  | "addagent"
  | "removeagent"
  | "addnode"
  | "removenode"
  | "addedge"
  | "removeedge"
  | "agententer"
  | "agentexit"
  | "agentcross"
  | "agentmove"
  | "agentemit";

export interface NetworkEvent {
  id?: number;
  type: NetworkEventType;
  agent?: Agent;
  node?: NetworkNode;
  edge?: NetworkEdge;
  emitted?: SequentialAgentEvent;
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
  node: NetworkNode;
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

// TODO: i think actually specific subtypes should not be named.
// as is, not all events with nodes are NetworkNodeEvents even though
// i would like to treat them as such.
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

export interface NetworkAgentEvent extends NetworkEvent {
  agent: Agent;
}

export interface AgentEnterEvent extends NetworkAgentEvent {
  type: "agententer";
  node: NetworkNode;
}

export interface AgentExitEvent extends NetworkAgentEvent {
  type: "agentexit";
  node: NetworkNode;
}

/**
 * Indicates agent has crossed an edge; emitted by the crossed edge
 **/
export interface AgentCrossEvent extends NetworkEdgeEvent {
  type: "agentcross";
  agent: Agent;
}

/**
 * Indicates agent has crossed an edge; emitted from the agent
 **/
export interface AgentMoveEvent extends NetworkAgentEvent {
  type: "agentmove";
  edge: NetworkEdge;
}

export function isAgentMove(ev: NetworkEvent): ev is AgentMoveEvent {
  return ev.type === "agentmove";
}

export interface AgentEmittedEvent extends NetworkAgentEvent {
  type: "agentemit";
  emitted: SequentialAgentEvent;
}
