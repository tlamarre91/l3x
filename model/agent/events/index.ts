import { Agent } from "../Agent";
import {  } from "@/model/network";
import { AgentCommand } from "../commands";
import { Status } from "@/utils";

export type AgentEventType =
  | "error"
  | "process"
  | "request"
  | "response"
  | "idle"
  | "echo"
  | "enterstate"
  | "exitstate"
  | "die";

// TODO: refactor to be like network events
export interface AgentEvent {
  type: AgentEventType;
  error?: string;
  message?: string;
  command?: AgentCommand;
  status?: Status;
}

export interface SequentialAgentEvent extends AgentEvent {
  id: number;
}

export interface AgentErrorEvent extends AgentEvent {
  type: "error"
  error: string;
}

export interface AgentEchoEvent extends AgentEvent {
  type: "echo";
  message: string;
}

export interface AgentProcessEvent extends AgentEvent {
  type: "process";
  command: AgentCommand;
  status: Status;
}
