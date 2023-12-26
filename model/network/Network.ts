import { BehaviorSubject, Observable, Subject, filter } from "rxjs";
import { Agent } from "@/model/agent";
import * as events from "./events";
import { NetworkClient } from "./NetworkClient";

export interface NetworkNode<NodeData = unknown, EdgeData = unknown> {
  type: "node";
  id: number;
  name: string;
  data: NodeData;
  agents$: Observable<Agent[]>;
  events$: Observable<events.NetworkNodeEvent>;
  edges$: Observable<NetworkEdge<EdgeData, NodeData>[]>;
}

export interface NetworkNodeController<NodeData = unknown, EdgeData = unknown> {
  node: NetworkNode<NodeData, EdgeData>;
  agentsSubject: BehaviorSubject<Agent[]>;
  edgesSubject: BehaviorSubject<NetworkEdge<EdgeData, NodeData>[]>;
}

export interface NetworkEdge<T = unknown, FromData = unknown, ToData = FromData> {
  type: "edge";
  id: number;
  name?: string | undefined;
  data?: T;
  from: NetworkNode<FromData, T>;
  to: NetworkNode<ToData, T>;
  events$: Observable<events.NetworkEdgeEvent>;
}

type EdgeToMap = Map<
  NetworkNode,
  NetworkEdge
>;

type EdgeFromMap = Map<
  NetworkNode,
  EdgeToMap
>;

export class Network<NodeData, EdgeData> {
  name: string;
  nodesByName: Map<string, NetworkNode<NodeData, EdgeData>>;
  nodeControllers: Map<NetworkNode, NetworkNodeController<NodeData, EdgeData>>;
  nodes$: Observable<NetworkNode<NodeData, EdgeData>[]>;

  /** Nested map where first key maps to collection of edges out of a node, second maps to specific edges */
  #edges: EdgeFromMap;

  /**
   * `Subject` for all network events
   * 
   * The "observer" side of the subject is private so that only this network can send events through it
   */
  readonly #eventSubject: Subject<events.SequentialNetworkEvent>;
  readonly #nodeSubject: BehaviorSubject<NetworkNode<NodeData, EdgeData>[]>;

  /** Public `Observable` for all network events */
  readonly events$: Observable<events.SequentialNetworkEvent>;
  /** Public `Observable` for network events related to nodes */
  readonly nodeEvents$: Observable<events.NetworkNodeEvent>;
  /** Public `Observable` for network events related to edges */
  readonly edgeEvents$: Observable<events.NetworkEdgeEvent>;

  #agentPositions: Map<Agent, NetworkNode>;
  #nextEventId: number = 0;
  #nextNodeId: number = 0;
  #nextEdgeId: number = 0;

  constructor(name: string) {
    this.name = name;
    this.nodesByName = new Map();
    this.nodeControllers = new Map();
    this.#edges = new Map();

    this.#agentPositions = new Map();

    this.#eventSubject = new Subject();
    this.#nodeSubject = new BehaviorSubject([]);
    this.events$ = this.#eventSubject.asObservable();
    this.nodes$ = this.#nodeSubject.asObservable();
    this.nodeEvents$ = this.events$.pipe(filter(events.isAboutNode));
    this.edgeEvents$ = this.events$.pipe(filter(events.isAboutEdge));
  }

  /**
   * Attach an ID to a `NetworkEvent` and emit it via `#eventSubject`
   */
  #emit(event: events.NetworkEvent) {
    const seqEvent = { id: this.#nextEventId++, ...event } satisfies events.SequentialNetworkEvent;
    this.#eventSubject.next(seqEvent);
  }

  addNode(data: NodeData, name?: string): NetworkNode<NodeData, EdgeData> {
    const id = this.#nextNodeId++;
    if (name == null) {
      name = `@n${id}`;
    } else if (name?.startsWith("@")) {
      throw new Error("illegal char");
    }

    if (this.nodesByName.has(name)) {
      throw new Error(`Network ${this.name} already has node ${name}`);
    }

    const agentsSubject = new BehaviorSubject<Agent[]>([]);
    const edgesSubject = new BehaviorSubject<NetworkEdge<EdgeData, NodeData>[]>([]);
    const events$ = this.nodeEvents$.pipe(filter((ev) => ev.node === node));

    const node: NetworkNode<NodeData, EdgeData> = {
      type: "node",
      id,
      name,
      data,
      agents$: agentsSubject.asObservable(),
      edges$: edgesSubject.asObservable(),
      events$
    };

    const controller = {
      node,
      agentsSubject,
      edgesSubject
    } satisfies NetworkNodeController<NodeData, EdgeData>;
    this.nodeControllers.set(node, controller);

    this.#registerNode(node);
    return node;
  }

  removeNode(node: NetworkNode) {
    const agentsSubject = this.nodeControllers.get(node)?.agentsSubject;
    if (agentsSubject == null) {
      throw new Error(`Network ${this.name} doesn't contain node ${node.name}`);
    }

    agentsSubject.getValue().forEach((agent) => {
      this.removeAgent(agent);
    });

    this.#removeAllEdgesFrom(node);
    this.#removeAllEdgesTo(node);

    this.#unregisterNode(node);

    this.nodeControllers.delete(node);
  }

  #registerNode(node: NetworkNode<NodeData, EdgeData>) {
    const nodes = this.#nodeSubject.getValue();
    this.#nodeSubject.next([...nodes, node]);
    this.#emit({ type: "addnode", node });
  }

  #unregisterNode(node: NetworkNode) {
    const nodes = this.#nodeSubject.getValue();
    this.#nodeSubject.next(nodes.filter((_node) => _node !== node));
    this.#emit({ type: "removenode", node });
  }

  getAgentsSubject(node: NetworkNode): BehaviorSubject<Agent[]> | undefined {
    return this.nodeControllers.get(node)?.agentsSubject;
  }

  getAgentsAt(node: NetworkNode<NodeData, EdgeData>): Agent[] {
    const agents = this.getAgentsSubject(node)?.getValue();
    return agents ?? [];
  }

  nodeHasAgent(node: NetworkNode<NodeData, EdgeData>, agent: Agent): boolean {
    return this.getAgentsAt(node).includes(agent);
  }

  addEdge(data: EdgeData, from: NetworkNode<NodeData, EdgeData>, to: NetworkNode<NodeData, EdgeData>, name?: string) {
    const id = this.#nextEdgeId++;
    if (name == null) {
      name = `@e${id}`;
    } else if (name?.startsWith("@")) {
      throw new Error("illegal char");
    }

    const fromController = this.nodeControllers.get(from);
    if (fromController == null) {
      throw new Error(`Node ${from.name} not in network`);
    }

    const toController = this.nodeControllers.get(to);
    if (toController == null) {
      throw new Error(`Node ${to.name} not in network`);
    }

    let edgesOut = this.#edges.get(from);

    if (edgesOut == null) {
      edgesOut = new Map();
      this.#edges.set(from, edgesOut);
    }

    const events$ = this.edgeEvents$.pipe(filter((ev) => ev.edge === edge));

    const edge: NetworkEdge<EdgeData, NodeData> = {
      type: "edge",
      id,
      name,
      data,
      from,
      to,
      events$
    };

    // TODO: yeah we need to handle if this is overwriting an existing edge
    edgesOut.set(to, edge);

    for (const controller of [fromController, toController]) {
      this.#registerEdge(controller, edge);
    }

    this.#emit({ type: "addedge", edge });
  }

  // TODO: if you just make this call a method that takes an "edgesOut" map,
  // then you could also call that method from the part of removeNode that prunes edges
  removeEdge(from: NetworkNode<NodeData, EdgeData>, to: NetworkNode<NodeData, EdgeData>) {
    const toEdgeMap = this.#edges.get(from);
    if (toEdgeMap == null) {
      throw new Error("edge out don't exist");
    }

    const edge = this.#removeEdgeTo(toEdgeMap, to);
    if (edge == null) {
      throw new Error("failed to remove edge?");
    }
  }

  #registerEdge(controller: NetworkNodeController<NodeData, EdgeData>, edge: NetworkEdge<EdgeData, NodeData>) {
    const subject = controller.edgesSubject;
    const edges = subject.getValue();
    subject.next([...edges, edge]);
  }

  #unregisterEdge(edge: NetworkEdge) {
    for (const node of [edge.from, edge.to]) {
      const controller = this.nodeControllers.get(node);
      if (controller == null) {
        throw new Error(`couldn't get controller to unregister node ${node.name}`);
      }

      const subject = controller.edgesSubject;
      const edges = subject.getValue();
      const newEdges = edges.filter((_edge) => _edge !== edge);
      console.log(edge, newEdges);

      subject.next(newEdges);
    }

    this.#emit({ type: "removeedge", edge });
  }

  #removeAllEdgesFrom(fromNode: NetworkNode) {
    const edgesFrom = this.#edges.get(fromNode) ?? [];

    for (const [_toNode, edge] of edgesFrom) {
      this.#unregisterEdge(edge);
    }

    this.#edges.delete(fromNode);
  }

  #removeAllEdgesTo(toNode: NetworkNode) {
    [... this.#edges.values()].forEach(
      (toEdgeMap) => {
        console.log("unreg!", toNode);
        this.#removeEdgeTo(toEdgeMap, toNode, false);
      }
    );
  }

  #removeEdgeTo(toEdgeMap: EdgeToMap, toNode: NetworkNode, raise = true) {
    const edge = toEdgeMap.get(toNode);
    if (edge == null) {
      if (raise) {
        throw new Error("edge in don't exist");
      }

      return;
    }

    toEdgeMap.delete(toNode);
    this.#unregisterEdge(edge);

    return edge;
  }

  hasEdge(from: NetworkNode, to: NetworkNode): boolean {
    const edge = this.#edges.get(from)?.get(to);
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
    console.log(this, agent, node);
    if (this.#agentPositions.get(agent) != null) {
      throw new Error(`Agent ${agent.name} is already in the network`);
    }

    if (!this.nodeControllers.has(node)) {
      throw new Error(`Node ${node.name} ain't in the network`);
    }

    this.#reassignAgentNode(agent, null, node);

    agent.networkClient = this.#makeNetworkClient(agent);

    this.#emit({ type: "addagent", agent });
    this.#emit({ type: "agententer", agent, node });
  }

  #makeNetworkClient<T>(client: T): NetworkClient<T> {
    return {
      client,
      request(_request) {
        return { status: "fu" };
      }
    };
  }

  moveAgent(agent: Agent, toNode: NetworkNode<NodeData, EdgeData>) {
    const fromNode = this.#agentPositions.get(agent);

    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    const edgeExists = this.hasEdge(fromNode, toNode);

    if (!edgeExists) {
      throw new Error(`ain't no edge from ${fromNode.name} to ${toNode.name}`);
    }

    this.#reassignAgentNode(agent, fromNode, toNode);

    this.#emit({ type: "agentexit", node: fromNode, agent });
    this.#emit({ type: "agententer", node: toNode, agent });
  }

  removeAgent(agent: Agent) {
    const fromNode = this.#agentPositions.get(agent);
    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    this.#reassignAgentNode(agent, fromNode, null);

    this.#emit({ type: "agentexit", node: fromNode, agent });
    this.#emit({ type: "removeagent", agent });
  }

  /**
   * Remove `agent` from `removeFromNode` if it's there; add it to `addToNode`.
   *
   * If `removeFromNode` is null, don't remove. If `addToNode` is null, don't add.
   */
  #reassignAgentNode(
    agent: Agent,
    removeFromNode: NetworkNode | null,
    addToNode: NetworkNode | null
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
