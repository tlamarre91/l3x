import { Subject } from "rxjs";
import { Agent } from "@/model/agent";
import * as events from "./events";

export interface NetworkNode {
  name?: string | undefined;
  data?: string | undefined;
  agents: Agent[];
}

export interface NetworkEdge {
  name?: string | undefined;
  data?: string | undefined;
}

export interface NetworkEdgeSpec {
  from?: NetworkNode;
  to?: NetworkNode;
  name?: string;
  data?: string;
}

export class Network {
  name: string;
  nodes: Set<NetworkNode>;
  /** Nested map where first key maps to collection of edges out of a node, second maps to specific edges */
  edges: Map<NetworkNode, Map<NetworkNode, NetworkEdge>>;
  readonly eventsSubject: Subject<events.NetworkEvent>;
  #agentPositions: Map<Agent, NetworkNode>;

  constructor(name: string) {
    this.name = name;
    this.nodes = new Set();
    this.edges = new Map();
    this.eventsSubject = new Subject();
    this.#agentPositions = new Map();
  }

  addNode(node: NetworkNode, edgesOut?: NetworkEdgeSpec[]) {
    if (this.nodes.has(node)) {
      throw new Error(`Network ${this.name} already has node ${node.name}`);
    }

    this.nodes.add(node);

    const event = new events.NetworkAddNodeEvent(this, node);
    this.eventsSubject.next(event);

    if (edgesOut == null) {
      return;
    }

    for (const edgeSpec of edgesOut) {
      if (edgeSpec.to == null) {
        throw new Error(`Invalid edge spec: ${edgeSpec}`);
      }

      const edge = { name: edgeSpec.name, data: edgeSpec.data };
      this.addEdge(node, edgeSpec.to, edge);

      const event = { type: "addedge", network: this, edgeSpec } satisfies events.NetworkAddEdgeEvent;
      this.eventsSubject.next(event);
    }
  }

  nodeHasAgent(node: NetworkNode, agent: Agent): boolean {
    return node.agents.includes(agent);
  }

  addEdge(from: NetworkNode, to: NetworkNode, edge: NetworkEdge) {
    if (!this.nodes.has(from)) {
      throw new Error(`Node ${from.name} not in network`);
    }

    if (!this.nodes.has(to)) {
      throw new Error(`Node ${to.name} not in network`);
    }

    let edgesOut = this.edges.get(from);

    if (edgesOut == null) {
      edgesOut = new Map();
      this.edges.set(from, edgesOut);
    }

    edgesOut.set(to, edge);
  }

  hasEdge(from: NetworkNode, to: NetworkNode): boolean {
    const edge = this.edges.get(from)?.get(to);
    return edge != null;
  }

  get agents() {
    console.log("getting agents");
    console.log(this.#agentPositions);
    const agents = [...this.#agentPositions.keys()];
    console.log({agents});
    return agents;
  }

  addAgent(agent: Agent, toNode: NetworkNode) {
    if (this.#agentPositions.get(agent) != null) {
      throw new Error(`Agent ${agent.name} is already in the network`);
    }

    this.#reassignAgentNode(agent, null, toNode);

    const event = { type: "addagent", network: this, agent } satisfies events.NetworkAddAgentEvent;
    this.eventsSubject.next(event);
  }

  moveAgent(agent: Agent, toNode: NetworkNode) {
    const fromNode = this.#agentPositions.get(agent);

    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    const edgeExists = this.hasEdge(fromNode, toNode);

    if (!edgeExists) {
      throw new Error(`ain't no edge from ${fromNode.name} to ${toNode.name}`);
    }

    this.#reassignAgentNode(agent, fromNode, toNode);
  }

  removeAgent(agent: Agent) {
    const fromNode = this.#agentPositions.get(agent);
    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    this.#reassignAgentNode(agent, fromNode, null);
  }

  /**
   * Remove `agent` from `removeFromNode` if it's there; add it to `addToNode`.
   *
   * If `removeFromNode` is null, don't remove. If `addToNode` is null, don't add.
   */
  #reassignAgentNode(agent: Agent, removeFromNode: NetworkNode | null, addToNode: NetworkNode | null) {
    if (removeFromNode != null) {
      removeFromNode.agents = removeFromNode.agents.filter((nodeAgent) => nodeAgent !== agent);
    }

    if (addToNode != null) {
      addToNode.agents.push(agent);
      this.#agentPositions.set(agent, addToNode);
    } else {
      this.#agentPositions.delete(agent);
    }
  }
}
