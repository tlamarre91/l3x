import { Agent } from "../Agent";
import { NetworkEdgeSpec } from "@/model/network";
import { AgentInstruction } from "../commands";

export type AgentEventType =
  | AgentInstruction // each type of instruction corresponds to an event type saying the command was completed
  | "error"
  | "process";

// TODO: refactor to be like network events
export interface AgentEvent {
  type: AgentEventType;
  agent: Agent;
  error?: string;
}

export interface AgentErrorEvent extends AgentEvent {
  type: "error"
  error: string;
}

export interface AgentEchoEvent extends AgentEvent {
  type: "echo";
  message: string;
}

export interface AgentSetStateEvent extends AgentEvent {
  type: "state";
  fromStateKey: string;
  toStateKey: string;
}

export interface AgentMoveEvent extends AgentEvent {
  type: "move";
  edgeSpec: NetworkEdgeSpec;
}

