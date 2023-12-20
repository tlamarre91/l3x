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
    }
  }

  removeNode(node: NetworkNode) {
    if (!this.nodes.has(node)) {
      throw new Error(`Network ${this.name} doesn't contain node ${node.name}`);
    }

    node.agents.forEach((agent) => {
      this.removeAgent(agent);
    });

    this.nodes.delete(node);
    const removeNodeEvent = new events.NetworkRemoveNodeEvent(this, node);
    this.eventsSubject.next(removeNodeEvent);

    const outEdgeMap = this.edges.get(node);
    const outNeighbors = outEdgeMap != null ? [...outEdgeMap.keys()] : [];
    this.edges.delete(node);

    const inNeighbors = [...this.edges.entries()]
      .map(([fromNode, toNodeMap]) => {
        const removed = toNodeMap.delete(node);
        return [fromNode, removed] satisfies [NetworkNode, boolean];
      })
      .filter(([_, removed]) => removed)
      .map(([fromNode, _]) => fromNode);

    for (const to of outNeighbors) {
      const event = new events.NetworkRemoveEdgeEvent(this, { from: node, to })
      this.eventsSubject.next(event);
    }

    for (const from of inNeighbors) {
      const event = new events.NetworkRemoveEdgeEvent(this, { from, to: node })
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

    // TODO: do we need to handle if this is overwriting an existing edge?
    edgesOut.set(to, edge);

    const event = new events.NetworkAddEdgeEvent(this, { from, to, ...edge });
    this.eventsSubject.next(event);
  }

  removeEdge(from: NetworkNode, to: NetworkNode) {
    const edgesOut = this.edges.get(from);
    if (edgesOut == null) {
      return; // TODO: throw? log?
    }

    const edge = edgesOut.get(to);
    if (edge == null) {
      return; // TODO: throw? log?
    }

    edgesOut.delete(to);
    const event = new events.NetworkRemoveEdgeEvent(this, { from, to, ...edge});
    this.eventsSubject.next(event);
  }

  hasEdge(from: NetworkNode, to: NetworkNode): boolean {
    const edge = this.edges.get(from)?.get(to);
    return edge != null;
  }

  get agents() {
    console.log("getting agents");
    console.log(this.#agentPositions);
    const agents = [...this.#agentPositions.keys()];
    console.log({ agents });
    return agents;
  }

  addAgent(agent: Agent, node: NetworkNode) {
    if (this.#agentPositions.get(agent) != null) {
      throw new Error(`Agent ${agent.name} is already in the network`);
    }

    if (!this.nodes.has(node)) {
      throw new Error(`Node ${node.name} ain't in the network`);
    }

    this.#reassignAgentNode(agent, null, node);

    const addEvent = new events.NetworkAddAgentEvent(this, agent);
    this.eventsSubject.next(addEvent);

    const enterEvent = new events.AgentEnterNodeEvent(this, node, agent);
    this.eventsSubject.next(enterEvent);
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

    const exitEvent = new events.AgentExitNodeEvent(this, toNode, agent);
    this.eventsSubject.next(exitEvent);

    const enterEvent = new events.AgentEnterNodeEvent(this, toNode, agent);
    this.eventsSubject.next(enterEvent);
  }

  removeAgent(agent: Agent) {
    const fromNode = this.#agentPositions.get(agent);
    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    this.#reassignAgentNode(agent, fromNode, null);

    const exitEvent = new events.AgentExitNodeEvent(this, fromNode, agent);
    this.eventsSubject.next(exitEvent);

    const removeEvent = new events.NetworkRemoveAgentEvent(this, agent);
    this.eventsSubject.next(removeEvent);
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
