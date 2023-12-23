import { BehaviorSubject, Observable, Subject, filter } from "rxjs";
import { Agent } from "@/model/agent";
import * as events from "./events";
import { AgentNetworkInterface } from "./AgentNetworkInterface";

export interface NetworkNode<T = unknown> {
  name: string;
  data: T;
  agents$: Observable<Agent[]>;
  events$: Observable<events.NetworkNodeEvent>;
}

export interface NetworkNodeController {
  node: NetworkNode;
  agentsSubject: BehaviorSubject<Agent[]>
}

export interface NetworkEdge<T = unknown, FromData = unknown, ToData = FromData> {
  name?: string | undefined;
  data?: T;
  from: NetworkNode<FromData>;
  to: NetworkNode<ToData>;
  events$: Observable<events.NetworkEdgeEvent>;
}

type EdgeToMap<NodeData, EdgeData> = Map<
  NetworkNode<NodeData>,
  NetworkEdge<EdgeData, NodeData>
>;

type EdgeFromMap<NodeData, EdgeData> = Map<
  NetworkNode<NodeData>,
  EdgeToMap<NodeData, EdgeData>
>;

export class Network<NodeData, EdgeData> {
  name: string;
  nodesByName: Map<string, NetworkNode<NodeData>>;
  nodeControllers: Map<NetworkNode<NodeData>, NetworkNodeController>;

  /** Nested map where first key maps to collection of edges out of a node, second maps to specific edges */
  edges: EdgeFromMap<NodeData, EdgeData>;

  /**
   * `Subject` for all network events
   * 
   * The "observer" side of the subject is private so that only this network can send events through it
   */
  readonly #eventSubject: Subject<events.SequentialNetworkEvent>;

  /** Public `Observable` for all network events */
  readonly events$: Observable<events.SequentialNetworkEvent>;
  /** Public `Observable` for network events related to nodes */
  readonly nodeEvents$: Observable<events.NetworkNodeEvent>;
  /** Public `Observable` for network events related to edges */
  readonly edgeEvents$: Observable<events.NetworkEdgeEvent>;

  #agentPositions: Map<Agent, NetworkNode<NodeData>>;
  #nextEventId: number = 0;
  #nextNodeId: number = 0;

  constructor(name: string) {
    this.name = name;
    this.nodesByName = new Map();
    this.nodeControllers = new Map();
    this.edges = new Map();

    this.#agentPositions = new Map();

    this.#eventSubject = new Subject();
    this.events$ = this.#eventSubject.asObservable();
    this.nodeEvents$ = this.events$.pipe(filter(events.isAboutNode));
    this.edgeEvents$ = this.events$.pipe(filter(events.isAboutEdge));
  }

  #emit(event: events.NetworkEvent) {
    const seqEvent = { id: this.#nextEventId++, ...event } satisfies events.SequentialNetworkEvent;
    this.#eventSubject.next(seqEvent);
  }

  addNode(data: NodeData, name?: string): NetworkNode<NodeData> {
    if (name == null) {
      name = `@n${this.#nextNodeId++}`;
    } else if (name?.startsWith("@")) {
      throw new Error("illegal char");
    }

    if (this.nodesByName.has(name)) {
      throw new Error(`Network ${this.name} already has node ${name}`);
    }

    const agentsSubject = new BehaviorSubject<Agent[]>([]);
    const events$ = this.nodeEvents$.pipe(filter((ev) => ev.node === node));

    const node: NetworkNode<NodeData> = {
      name,
      data,
      agents$: agentsSubject.asObservable(),
      events$
    };

    const controller = {
      node,
      agentsSubject
    } satisfies NetworkNodeController;
    this.nodeControllers.set(node, controller);

    this.#emit({ type: "addnode", network: this, node });
    return node;
  }

  removeNode(node: NetworkNode<NodeData>) {
    const agentsSubject = this.nodeControllers.get(node)?.agentsSubject;
    if (agentsSubject == null) {
      throw new Error(`Network ${this.name} doesn't contain node ${node.name}`);
    }

    agentsSubject.getValue().forEach((agent) => {
      this.removeAgent(agent);
    });

    this.#removeAllEdgesFrom(node);
    this.#removeAllEdgesTo(node);

    this.nodeControllers.delete(node);
    this.#emit({ type: "removenode", network: this, node });
  }

  getAgentsSubject(node: NetworkNode<NodeData>): BehaviorSubject<Agent[]> | undefined {
    return this.nodeControllers.get(node)?.agentsSubject;
  }

  getAgentsAt(node: NetworkNode<NodeData>): Agent[] {
    const agents = this.getAgentsSubject(node)?.getValue();
    return agents ?? [];
  }

  nodeHasAgent(node: NetworkNode<NodeData>, agent: Agent): boolean {
    return this.getAgentsAt(node).includes(agent);
  }

  addEdge(name: string, data: EdgeData, from: NetworkNode<NodeData>, to: NetworkNode<NodeData>) {
    if (!this.nodeControllers.has(from)) {
      throw new Error(`Node ${from.name} not in network`);
    }

    if (!this.nodeControllers.has(to)) {
      throw new Error(`Node ${to.name} not in network`);
    }

    let edgesOut = this.edges.get(from);

    if (edgesOut == null) {
      edgesOut = new Map();
      this.edges.set(from, edgesOut);
    }

    const events$ = this.edgeEvents$.pipe(filter((ev) => ev.edge === edge));

    const edge: NetworkEdge<EdgeData, NodeData> = {
      name, data, from, to, events$
    };

    // TODO: yeah we need to handle if this is overwriting an existing edge
    edgesOut.set(to, edge);

    this.#emit({ type: "addedge", network: this, edge });
  }

  // TODO: if you just make this call a method that takes an "edgesOut" map,
  // then you could also call that method from the part of removeNode that prunes edges
  removeEdge(from: NetworkNode<NodeData>, to: NetworkNode<NodeData>) {
    const toEdgeMap = this.edges.get(from);
    if (toEdgeMap == null) {
      throw new Error("edge out don't exist");
    }
    this.#removeEdgeTo(toEdgeMap, to);
  }

  #removeAllEdgesFrom(fromNode: NetworkNode<NodeData>) {
    const edgesFrom = this.edges.get(fromNode) ?? [];

    for (const [_toNode, edge] of edgesFrom) {
      this.#emit({ type: "removeedge", network: this, edge });
    }

    this.edges.delete(fromNode);
  }

  #removeAllEdgesTo(toNode: NetworkNode<NodeData>) {
    [... this.edges.values()].forEach(
      (toEdgeMap) => {
        this.#removeEdgeTo(toEdgeMap, toNode, false);
      }
    );
  }

  #removeEdgeTo(toEdgeMap: EdgeToMap<NodeData, EdgeData>, toNode: NetworkNode<NodeData>, raise = true) {
    const edge = toEdgeMap.get(toNode);
    if (edge == null) {
      if (raise) {
        throw new Error("edge in don't exist");
      }

      return;
    }

    toEdgeMap.delete(toNode);
    this.#emit({ type: "removeedge", network: this, edge });
  }

  hasEdge(from: NetworkNode<NodeData>, to: NetworkNode<NodeData>): boolean {
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

  addAgent(agent: Agent, node: NetworkNode<NodeData>) {
    console.log(this, agent, node);
    if (this.#agentPositions.get(agent) != null) {
      throw new Error(`Agent ${agent.name} is already in the network`);
    }

    if (!this.nodeControllers.has(node)) {
      throw new Error(`Node ${node.name} ain't in the network`);
    }

    this.#reassignAgentNode(agent, null, node);

    // TODO: do somethin with this
    agent.networkInterface = {
      agent,
      send(_request) {
        return { status: "fu" };
      }
    };

    this.#emit({ type: "addagent", network: this, agent });
    this.#emit({ type: "agententer", network: this, agent, node });
  }

  moveAgent(agent: Agent, toNode: NetworkNode<NodeData>) {
    const fromNode = this.#agentPositions.get(agent);

    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    const edgeExists = this.hasEdge(fromNode, toNode);

    if (!edgeExists) {
      throw new Error(`ain't no edge from ${fromNode.name} to ${toNode.name}`);
    }

    this.#reassignAgentNode(agent, fromNode, toNode);

    this.#emit({ type: "agentexit", network: this, node: fromNode, agent });
    this.#emit({ type: "agententer", network: this, node: toNode, agent });
  }

  removeAgent(agent: Agent) {
    const fromNode = this.#agentPositions.get(agent);
    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    this.#reassignAgentNode(agent, fromNode, null);

    this.#emit({ type: "agentexit", network: this, node: fromNode, agent });
    this.#emit({ type: "removeagent", network: this, agent });
  }

  /**
   * Remove `agent` from `removeFromNode` if it's there; add it to `addToNode`.
   *
   * If `removeFromNode` is null, don't remove. If `addToNode` is null, don't add.
   */
  #reassignAgentNode(
    agent: Agent,
    removeFromNode: NetworkNode<NodeData> | null,
    addToNode: NetworkNode<NodeData> | null
  ) {
    if (removeFromNode != null) {
      const agentsSubject = this.getAgentsSubject(removeFromNode);
      if (agentsSubject == null) {
        throw new Error("where's the agents");
      }
      agentsSubject.next(
        agentsSubject.getValue()
          .filter((nodeAgent) => nodeAgent !== agent)
      );
    }

    if (addToNode != null) {

      const agentsSubject = this.getAgentsSubject(addToNode);
      if (agentsSubject == null) {
        throw new Error("where's the agents");
      }

      agentsSubject.next([...agentsSubject.getValue(), agent]);
      this.#agentPositions.set(agent, addToNode);

    } else if (removeFromNode == null) {

      throw new Error("why reassign to and from null???");

    } else {

      this.#agentPositions.delete(agent);

    }
  }
}
