import { Agent } from "@/model/agent";

export interface AgentNetworkRequest {
  type: "move" | "route";
  nodeName?: string;
  edgeName?: string;
}

export interface AgentNetworkResponse {
  status: "ok" | "fu";
  message?: string;
}

/**
 * Unfortunate name for a collection of methods an Agent can use
 * to make requests to a Network
 */
export interface AgentNetworkInterface {
  agent: Agent;
  send(request: AgentNetworkRequest): AgentNetworkResponse;
}
