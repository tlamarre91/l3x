import { Command } from "@/model/agent/programs/commands";
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

export interface AgentEvent {
  type: AgentEventType;
  errorName?: string;
  errorMessage?: string;
  message?: string;
  command?: Command;
  status?: Status;
}

export interface SequentialAgentEvent extends AgentEvent {
  id: number;
}

export interface AgentErrorEvent extends AgentEvent {
  type: "error"
  errorName: string;
  errorMessage: string;
}

export function isError(ev: AgentEvent): ev is AgentErrorEvent {
  return ev.type === "error";
}

export interface AgentEchoEvent extends AgentEvent {
  type: "echo";
  message: string;
}

export interface AgentProcessEvent extends AgentEvent {
  type: "process";
  command: Command;
  status: Status;
}
