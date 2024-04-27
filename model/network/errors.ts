import { Agent } from "../agent";
import { L3xError } from "../errors";
import { NetworkEdge, NetworkNode } from "./Network";

export class ReservedNameError extends L3xError {
  name = "ReservedNameError";

  constructor(name: string) {
    super(`Names starting with "@" are reserved; invalid name: ${name}`);
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

  constructor(node: NetworkNode) {
    super(`Node not found: ${node.name}`);
  }
}

export class EdgeNotFoundError extends NetworkError {
  name = "EdgeNotFoundError";

  constructor(edge: NetworkEdge) {
    super(`Edge not found: ${edge.name}`);
  }
}

export class AgentNotFoundError extends NetworkError {
  name = "AgentNotFoundError";

  constructor(agent: Agent) {
    super(`Agent not found: ${agent.name}`);
  }
}

export class BadRequestError extends NetworkError {
  name = "BadRequestError";
}
