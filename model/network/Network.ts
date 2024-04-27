import { BehaviorSubject, Observable, Subject, filter } from "rxjs";
import { Agent } from "@/model/agent";
import { SequentialAgentEvent } from "@/model/agent/events";
import * as events from "./events";
import { NetworkClient, NetworkRequest, NetworkResponse, isMove as isMoveRequest, responseFromError } from "./NetworkClient";
import { BufferStore } from "@/model/data/BufferStore";
import { AgentNotFoundError, BadRequestError, InvalidOperationError, InvalidStateError, NetworkError, NodeNotFoundError, ReservedNameError } from "./errors";
import { NotImplementedError } from "../errors";

export interface NetworkNode {
  readonly type: "node";
  readonly id: number;
  readonly name: string;
  store: BufferStore;
  agents$: Observable<Agent[]>;
  getAgents: () => Agent[];
  edges$: Observable<NetworkEdge[]>;
  getEdges: () => NetworkEdge[];
  events$: Observable<events.NetworkNodeEvent>;
}

export interface NetworkNodeProps {
  name: NetworkNode["name"];
  store: NetworkNode["store"];
  agents: ReturnType<NetworkNode["getAgents"]>;
  // TODO: can i pass in initial agents and edges this way?
}

export interface NetworkNodeController {
  node: NetworkNode;
  agentsSubject: BehaviorSubject<Agent[]>;
  edgesSubject: BehaviorSubject<NetworkEdge[]>;
  edgesOutByName: Map<string, NetworkEdge>;
  emit: (event: events.NetworkEvent) => void;
}

export interface NetworkEdge {
  type: "edge";
  id: number;
  name: string;
  store: BufferStore;
  from: NetworkNode;
  to: NetworkNode;
  events$: Observable<events.NetworkEdgeEvent>;
}

export interface NetworkEdgeProps {
  name: NetworkEdge["name"];
  store: NetworkEdge["store"];
}

export interface NetworkEdgeController {
  edge: NetworkEdge;
  fromController: NetworkNodeController;
  toController: NetworkNodeController;
  emit: (event: events.NetworkEvent) => void;
}


export interface NetworkAgentController {
  agent: Agent;
  occupiedNodeController: NetworkNodeController;
  networkAgentEvents$: Observable<events.NetworkAgentEvent>;
  emit: (event: events.NetworkEvent) => void;
}

type EdgeToMap = Map<NetworkNode, NetworkEdge>;
type EdgeFromMap = Map<NetworkNode, EdgeToMap>;

export interface NetworkConfig {
  killOnBadRequest: boolean;
  logEvents: boolean;
}

const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  killOnBadRequest: true,
  logEvents: false,
};

export class Network {
  readonly config: NetworkConfig;
  readonly eventLog = new Array<events.SequentialNetworkEvent>();
  readonly nodesByName = new Map<string, NetworkNode>();

  // TODO: this "controller" stuff is getting silly isn't it
  readonly #nodeControllers = new Map<NetworkNode, NetworkNodeController>();
  readonly #edgeControllers = new Map<NetworkEdge, NetworkEdgeController>();

  /**
   * `Subject` for all network events
   * 
   * The "observer" side of the subject is private so that only this network can send events through it.
   *
   * Serves as an event bus for event sources inside the network (nodes, agents, edges).
   */
  readonly #eventSubject = new Subject<events.SequentialNetworkEvent>;
  readonly #nodesSubject = new BehaviorSubject(new Array<NetworkNode>());
  readonly #agentsSubject = new BehaviorSubject(new Array<Agent>());

  /** Public `Observable` for all network events */
  readonly events$: Observable<events.SequentialNetworkEvent> = this.#eventSubject.asObservable();
  /** Public `Observable` for network events related to nodes */
  readonly nodeEvents$: Observable<events.NetworkNodeEvent> = this.events$.pipe(filter(events.isAboutNode));
  /** Public `Observable` for network events related to edges */
  readonly edgeEvents$: Observable<events.NetworkEdgeEvent> = this.events$.pipe(filter(events.isAboutEdge));
  /** Public `Observable` for network events related to agents */
  readonly agentEvents$: Observable<events.NetworkAgentEvent> = this.events$.pipe(filter(events.isAboutAgent));

  readonly nodes$: Observable<NetworkNode[]> = this.#nodesSubject.asObservable();
  readonly agents$: Observable<Agent[]> = this.#agentsSubject.asObservable();

  /** Nested map where first key maps to collection of edges out of a node, second maps to specific edges */
  readonly #edges: EdgeFromMap = new Map();

  /** Map to `Observable` for network events related to each particular agent */
  // readonly #agentEventsMap = new Map<Agent, Observable<events.NetworkAgentEvent>>();
  readonly #agentControllers = new Map<Agent, NetworkAgentController>();
  #pendingRequestCallbacks: (() => void)[] = [];
  #nextEventId: number = 0;
  #nextNodeId: number = 0;
  #nextEdgeId: number = 0;

  clockCount: number = 0;

  constructor(public name: string, config: Partial<NetworkConfig> = {}) {
    console.log(`creating network ${name}`);
    const fullConfig: NetworkConfig = { ...DEFAULT_NETWORK_CONFIG, ...config };
    this.config = fullConfig;
  }

  getNodes(): NetworkNode[]{
    return this.#nodesSubject.getValue();
  }

  /**
   * Attach an ID to a `NetworkEvent` and emit it via `#eventSubject`
   *
   * TODO: since we're forwarding events from below now, could also attach a `source` here
   */
  #emit(event: events.NetworkEvent) {
    const seqEvent = { id: this.#nextEventId++, ...event } satisfies events.SequentialNetworkEvent;
    this.#eventSubject.next(seqEvent);

    if (this.config.logEvents) {
      this.eventLog.push(seqEvent);
    }
  }

  process() {
    for (const agent of this.getAgents()) {
      agent.process();
    }

    for (const callback of this.#pendingRequestCallbacks) {
      try {
        callback();
      } catch (err) {
        console.error("Unable to process request callback:", callback.name || "(anonymous)");
        console.error(err);
      }
      // TODO: process by popping off priority queue
    }

    this.#pendingRequestCallbacks = [];

    this.clockCount += 1;
  }

  dumpState() {
    // TODO: right now this is just for the purpose of rendering to a mermaid chart
    // but will want to handle full serialization (and remove circular references)

    const edges = [...this.#edges.values()].flatMap((edgeMap) => [...edgeMap.values()]);
    const agentPositions = [...this.#agentControllers.entries()];

    const state = {
      nodes: [...this.#nodesSubject.getValue()],
      edges,
      agentPositions
    };

    return state;
  }

  addNode(nodeProps: Partial<NetworkNodeProps> = {}): NetworkNode {
    // TODO: deal with "stores"???
    let { name, store = {} } = nodeProps;

    const id = this.#nextNodeId++;

    if (name == null) {
      name = `@n${id}`;
    } else if (name?.startsWith("@")) {
      throw new ReservedNameError(name);
    }

    if (this.nodesByName.has(name)) {
      throw new InvalidOperationError(`Network ${this.name} already has node ${name}`);
    }

    const agentsSubject = new BehaviorSubject<Agent[]>([]);
    const edgesSubject = new BehaviorSubject<NetworkEdge[]>([]);
    const eventSubject = new Subject<events.NetworkNodeEvent>();
    const events$ = eventSubject.asObservable();

    const node: NetworkNode = {
      type: "node",
      id,
      name,
      store,
      agents$: agentsSubject.asObservable(),
      getAgents: agentsSubject.getValue, // TODO: do these need to be () => agentsSubject.getValue(), etc?
      edges$: edgesSubject.asObservable(),
      getEdges: edgesSubject.getValue,
      events$,
    };

    this.nodesByName.set(name, node);

    const controller: NetworkNodeController = {
      node,
      agentsSubject,
      edgesSubject,
      edgesOutByName: new Map(),
      emit: (ev) => eventSubject.next({ ...ev, node }),
    };

    this.#nodeControllers.set(node, controller);
    this.#registerNode(controller);

    return node;
  }

  removeNode(node: NetworkNode) {
    const controller = this.#nodeControllers.get(node);
    if (controller == null) {
      throw new Error(`Network ${this.name} doesn't have controller for node ${node.name}`);
    }
    const agentsSubject = controller.agentsSubject;

    agentsSubject.getValue().forEach((agent) => {
      this.removeAgent(agent);
    });

    this.#removeAllEdgesFrom(node);
    this.#removeAllEdgesTo(node);

    this.#unregisterNode(controller);

    this.#nodeControllers.delete(node);
  }

  // #emitFromNode(node: NetworkNode, event: events.NetworkEvent) {
  //   this.#nodeControllers.get(node)?.emit(event);
  // }

  #registerNode(controller: NetworkNodeController) {
    const node = controller.node;
    const nodes = this.#nodesSubject.getValue();
    this.#nodesSubject.next([...nodes, node]);

    node.events$.subscribe((ev) => this.#emit(ev));  // forward all events up to the network

    controller.emit({ type: "addnode" });
  }

  #unregisterNode(controller: NetworkNodeController) {
    const node = controller.node;
    const nodes = this.#nodesSubject.getValue();
    this.#nodesSubject.next(nodes.filter((_node) => _node !== node));

    controller.emit({ type: "removenode" });
  }

  addEdge(
    from: NetworkNode,
    to: NetworkNode,
    edgeProps: Partial<NetworkEdgeProps> = {},
  ) {
    const id = this.#nextEdgeId++;

    let { name, store } = edgeProps;

    // TODO: i wasn't really thinking about how names are more meaningful for
    // edges because agents request to cross edges by name
    if (name == null) {
      name = `@e${id}`;
    } else if (name?.startsWith("@")) {
      throw new ReservedNameError(name);
    }

    const fromController = this.#nodeControllers.get(from);
    if (fromController == null) {
      throw new NodeNotFoundError(from);
    }

    const toController = this.#nodeControllers.get(to);
    if (toController == null) {
      throw new NodeNotFoundError(to);
    }

    let edgesOut = this.#edges.get(from);

    if (edgesOut == null) {
      edgesOut = new Map();
      this.#edges.set(from, edgesOut);
    }

    const eventSubject = new Subject<events.NetworkEdgeEvent>();
    const events$ = eventSubject.asObservable();

    if (edgesOut.has(to)) {
      throw new InvalidOperationError(`can't overwrite existing edge from ${from.name} to ${to.name}`);
    }

    if (fromController.edgesOutByName.has(name)) {
      throw new InvalidOperationError(`edge with name ${name} already exists out of ${from.name}`);
    }

    const edge: NetworkEdge = {
      type: "edge",
      id,
      name,
      store,
      from,
      to,
      events$
    };

    const edgeController: NetworkEdgeController = {
      edge,
      fromController,
      toController,
      emit: (ev) => eventSubject.next({ ...ev, edge })
    };

    edgesOut.set(to, edge);
    this.#edgeControllers.set(edge, edgeController);

    this.#registerEdge(edgeController);
  }

  removeEdge(from: NetworkNode, to: NetworkNode) {
    const toEdgeMap = this.#edges.get(from);
    if (toEdgeMap == null) {
      throw new InvalidOperationError("edge out don't exist");
    }

    const edge = this.#removeEdgeTo(toEdgeMap, to);
    if (edge == null) {
      throw new NetworkError("failed to remove edge?");
    }

    const fromController = this.#nodeControllers.get(from);
    if (fromController == null) {
      throw new InvalidStateError(`how is there not a controller for node ${from.name}`);
    }
  }

  #registerEdge(edgeController: NetworkEdgeController) {
    const edge = edgeController.edge;

    const fromController = edgeController.fromController;
    fromController.edgesOutByName.set(edge.name, edge);

    for (const nodeController of [fromController, edgeController.toController]) {
      const edgesSubject = nodeController.edgesSubject;
      const edges = edgesSubject.getValue();
      // TODO: should probably just say `.next([...fromController.edgesOutByName.values()])`
      edgesSubject.next([...edges, edge]);
    }

    edge.events$.subscribe((ev) => this.#emit(ev));

    edgeController.emit({ type: "addedge" });
  }

  #unregisterEdge(edgeController: NetworkEdgeController) {
    const edge = edgeController.edge;

    const fromController = edgeController.fromController;
    fromController.edgesOutByName.delete(edge.name);

    for (const nodeController of [fromController, edgeController.toController]) {
      const subject = nodeController.edgesSubject;
      const edges = subject.getValue();
      const newEdges = edges.filter((_edge) => _edge !== edge);

      subject.next(newEdges);
    }

    edgeController.emit({ type: "removeedge" });
  }

  #removeAllEdgesFrom(fromNode: NetworkNode) {
    const edgesFrom = this.#edges.get(fromNode) ?? [];

    for (const [_toNode, edge] of edgesFrom) {
      const edgeController = this.#edgeControllers.get(edge);
      if (edgeController == null) {
        throw new Error(`how is there not a controller for edge ${edge.name}`);
      }
      this.#unregisterEdge(edgeController);
    }

    this.#edges.delete(fromNode);
  }

  #removeAllEdgesTo(toNode: NetworkNode) {
    [... this.#edges.values()].forEach(
      (toEdgeMap) => {
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

    const edgeController = this.#edgeControllers.get(edge);
    if (edgeController == null) {
      throw new Error(`how is there not a controller for edge ${edge.name}`);
    }

    this.#unregisterEdge(edgeController);

    return edge;
  }

  hasEdge(from: NetworkNode, to: NetworkNode): boolean {
    const edge = this.#edges.get(from)?.get(to);
    return edge != null;
  }

  getAgents(): Agent[] {
    return this.#agentsSubject.getValue();
  }

  addAgent(agent: Agent, node: NetworkNode) {
    if (this.#agentControllers.get(agent) != null) {
      throw new NetworkError(`Agent ${agent.name} is already in the network`);
    }

    const nodeController = this.#nodeControllers.get(node);
    if (nodeController == null) {
      throw new NodeNotFoundError(node);
    }

    const networkAgentEventsSubject = new Subject<events.NetworkAgentEvent>();
    function forwardAgentEvent(ev: SequentialAgentEvent) {
      networkAgentEventsSubject.next({ type: "agentemit", agent, emitted: ev });
    }

    agent.events$.subscribe(forwardAgentEvent);

    const agentController: NetworkAgentController = {
      agent,
      occupiedNodeController: nodeController,
      networkAgentEvents$: networkAgentEventsSubject.asObservable(),
      emit: (ev) => networkAgentEventsSubject.next({ ...ev, agent })
    };

    networkAgentEventsSubject.subscribe((ev) => this.#emit(ev));

    this.#agentControllers.set(agent, agentController);

    this.#reassignAgentNode(agentController, null, nodeController);

    agent.networkClient = this.#makeNetworkClient(agent);

    // TODO: emit these from the node controller
    agentController.emit({ type: "addagent", node });
    nodeController.emit({ type: "agententer", agent });
    this.#agentsSubject.next([...this.getAgents(), agent]);
  }

  getAgentEvents(agent: Agent): Observable<events.NetworkAgentEvent> {
    const agentEvents$ = this.#agentControllers.get(agent)?.networkAgentEvents$;
    if (agentEvents$ == null) {
      throw new AgentNotFoundError(agent);
    }

    return agentEvents$;
  }

  getAgentNode(agent: Agent): NetworkNode | undefined {
    return this.#agentControllers.get(agent)?.occupiedNodeController.node;
  }

  /** throws if move is invalid. */
  validateMoveAgent(agentController: NetworkAgentController, edge: NetworkEdge) {
    // TODO: is this needed?
    const agent = agentController.agent;
    const toNode = edge.to;

    const agentPosition = agentController.occupiedNodeController.node;

    if (agentPosition !== edge.from) {
      throw new BadRequestError(`Agent ${agent.name} is at node ${agentPosition.name} but edge ${edge.name} leads out of node ${edge.from.name}`);
    }

    // TODO: actually shouldn't this be comparing `edge` to the contents of the edge map?
    const edgeExists = this.hasEdge(agentPosition, toNode);

    if (!edgeExists) {
      throw new Error(`ain't no edge from ${agentPosition.name} to ${toNode.name}`);
    }
  }

  #moveAgent(agentController: NetworkAgentController, edgeController: NetworkEdgeController) {
    const edge = edgeController.edge;
    this.validateMoveAgent(agentController, edge);

    const { fromController, toController } = edgeController;

    this.#reassignAgentNode(agentController, fromController, toController);

    const agent = agentController.agent;

    edgeController.fromController.emit({ type: "agentexit", agent });
    edgeController.emit({ type: "agentcross", agent });
    edgeController.toController.emit({ type: "agententer", agent });
    agentController.emit({ type: "agentmove", edge });
  }

  removeAgent(agent: Agent) {
    const agentController = this.#agentControllers.get(agent);
    if (agentController == null) {
      throw new AgentNotFoundError(agent);
    }

    const { occupiedNodeController } = agentController;
    this.#reassignAgentNode(agentController, occupiedNodeController, null);

    occupiedNodeController.emit({ type: "agentexit", agent });
    agentController.emit({ type: "removeagent" });

    this.#agentControllers.delete(agent);
    this.#agentsSubject.next(this.getAgents().filter((agent_) => agent_ !== agent));
  }

  /**
   * Remove `agent` from `removeFromNode` if it's there; add it to `addToNode`.
   *
   * If `removeFromNode` is null, don't remove. If `addToNode` is null, don't add.
   */
  #reassignAgentNode(
    agentController: NetworkAgentController,
    removeFromNodeController: NetworkNodeController | null,
    addToNodeController: NetworkNodeController | null
  ) {
    const agent = agentController.agent;
    if (removeFromNodeController != null) {
      const agentsSubject = removeFromNodeController.agentsSubject;

      agentsSubject.next(
        agentsSubject.getValue()
          .filter((nodeAgent) => nodeAgent !== agent)
      );
    }

    if (addToNodeController != null) {
      const agentsSubject = addToNodeController.agentsSubject;

      agentsSubject.next([...agentsSubject.getValue(), agent]);

      agentController.occupiedNodeController = addToNodeController;
    }
    else if (removeFromNodeController == null) {
      throw new InvalidOperationError("Likely unintended assignment from null node to null node");
    }
    else {
      this.#agentControllers.delete(agent);
    }
  }

  /**
   * Make a `NetworkClient` "network interface device" for an agent (or something else, i guess)
   */
  #makeNetworkClient<T>(client: T): NetworkClient<T> {
    if (!(client instanceof Agent)) {
      throw new NotImplementedError("not ready for clients that aren't agents");
    }

    const agentController = this.#agentControllers.get(client);
    if (agentController == null) {
      throw new AgentNotFoundError(client);
    }

    const request = (req: NetworkRequest) => this.#handleAgentRequest(agentController, req);

    return { client, request };
  }

  #handleAgentRequest(agentController: NetworkAgentController, request: NetworkRequest): NetworkResponse {
    try {
      const response = this.#handleAgentRequestUnsafe(agentController, request);
      return response;
    } catch (error) {
      return responseFromError(error);
    }
  }

  #handleAgentRequestUnsafe(agentController: NetworkAgentController, request: NetworkRequest): NetworkResponse {
    const nodeController = agentController.occupiedNodeController;

    if (isMoveRequest(request)) {
      const edge = nodeController.edgesOutByName.get(request.edgeName);

      if (edge == null) {
        throw new BadRequestError(`no edge out of ${nodeController.node.name} with name ${request.edgeName}`);
      }

      const edgeController = this.#edgeControllers.get(edge);
      if (edgeController == null) {
        throw new InvalidStateError(`how is there not a controller for edge ${edge.name}`);
      }

      const callback = () => {
        this.#moveAgent(agentController, edgeController);
      };

      this.#pendingRequestCallbacks.push(callback);
      return { status: "ok" };
    }

    throw new NotImplementedError(`can't handle ${request.type} request`);
  }
}
