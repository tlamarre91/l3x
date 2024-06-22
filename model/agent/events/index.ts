import type { StatusValue } from "@/utils";
import { Command } from "@/model/agent/programs/commands";

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
  status?: StatusValue;
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
  status: StatusValue;
}
