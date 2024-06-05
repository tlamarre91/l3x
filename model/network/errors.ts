import { L3xError } from "@/model/errors";
import type { Agent } from "@/model/agent";
import type { NetworkEdge } from "./NetworkEdge";
import type { NetworkNode } from "./NetworkNode";

export class ReservedNameError extends L3xError {
  name = "ReservedNameError";

  constructor(public triedName: string) {
    super(`Names starting with "@" are reserved; invalid name: ${triedName}`);
  }
}

export class NetworkError extends L3xError {
  name = "NetworkError";
}

export class InvalidStateError extends NetworkError {
  name = "InvalidStateError";
}

export class InvalidOperationError extends NetworkError {
  name = "InvalidOperationError";
}

export class NodeNotFoundError extends NetworkError {
  name = "NodeNotFoundError";

  constructor(public node: NetworkNode) {
    super(`Node not found: ${node.name}`);
  }
}

export class EdgeNotFoundError extends NetworkError {
  name = "EdgeNotFoundError";

  constructor(public edge: NetworkEdge) {
    super(`Edge not found: ${edge.name}`);
  }
}

export class AgentNotFoundError extends NetworkError {
  name = "AgentNotFoundError";

  constructor(public agent: Agent) {
    super(`Agent not found: ${agent.name}`);
  }
}

export class BadRequestError extends NetworkError {
  name = "BadRequestError";
}
