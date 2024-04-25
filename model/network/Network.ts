import { BehaviorSubject, Observable, Subject, filter } from "rxjs";
import { Agent } from "@/model/agent";
import * as events from "./events";
import { NetworkClient, NetworkRequest, NetworkResponse, isMove, responseFromError } from "./NetworkClient";
import { BufferStore } from "@/model/data/BufferStore";

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

export interface NetworkEdgeController {
  edge: NetworkEdge;
  fromController: NetworkNodeController;
  toController: NetworkNodeController;
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
}

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
  readonly #agentEventsMap = new Map<Agent, Observable<events.NetworkAgentEvent>>();
  readonly #agentPositions = new Map<Agent, NetworkNode>();
  #pendingRequestCallbacks: (() => void)[] = [];
  #nextEventId: number = 0;
  #nextNodeId: number = 0;
  #nextEdgeId: number = 0;

  clockCount: number = 0;

  constructor(public name: string, config: Partial<NetworkConfig> = {}) {
    console.log(`creating network ${name}`);
    const fullConfig: NetworkConfig = { ...DEFAULT_NETWORK_CONFIG, ...config };
    this.config = fullConfig;
    
    // this.events$.subscribe((ev) => console.log(ev));
  }

  getNodes(): NetworkNode[]{
    return this.#nodesSubject.getValue();
  }

  /**
   * Attach an ID to a `NetworkEvent` and emit it via `#eventSubject`
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
    const agentPositions = [...this.#agentPositions.entries()];

    const state = {
      nodes: [...this.#nodesSubject.getValue()],
      edges,
      agentPositions
    };

    return state;
  }

  addNode(store: BufferStore, name?: string): NetworkNode {
    const id = this.#nextNodeId++;
    if (name == null) {
      name = `@n${id}`;
    } else if (name?.startsWith("@")) {
      throw new Error("Names starting with @ are reserved");
    }

    if (this.nodesByName.has(name)) {
      throw new Error(`Network ${this.name} already has node ${name}`);
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
      emit: (ev: events.NetworkEvent) => {
        eventSubject.next({ ...ev, node });
      },
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

  #getAgentsSubject(node: NetworkNode): BehaviorSubject<Agent[]> | undefined {
    return this.#nodeControllers.get(node)?.agentsSubject;
  }

  addEdge(
    store: BufferStore,
    from: NetworkNode,
    to: NetworkNode,
    name?: string
  ) {
    const id = this.#nextEdgeId++;

    if (name == null) {
      name = `@e${id}`;
    } else if (name?.startsWith("@")) {
      throw new Error("Names starting with @ are reserved");
    }

    const fromController = this.#nodeControllers.get(from);
    if (fromController == null) {
      throw new Error(`Node ${from.name} not in network`);
    }

    const toController = this.#nodeControllers.get(to);
    if (toController == null) {
      throw new Error(`Node ${to.name} not in network`);
    }

    let edgesOut = this.#edges.get(from);

    if (edgesOut == null) {
      edgesOut = new Map();
      this.#edges.set(from, edgesOut);
    }

    const eventSubject = new Subject<events.NetworkEdgeEvent>();
    const events$ = eventSubject.asObservable();

    if (edgesOut.has(to)) {
      throw new Error(`can't overwrite existing edge from ${from.name} to ${to.name}`);
    }

    if (fromController.edgesOutByName.has(name)) {
      throw new Error(`edge with name ${name} already exists out of ${from.name}`);
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
      emit: (ev: events.NetworkEvent) => eventSubject.next({ ...ev, edge })
    };

    edgesOut.set(to, edge);
    this.#edgeControllers.set(edge, edgeController);

    this.#registerEdge(edgeController);
  }

  removeEdge(from: NetworkNode, to: NetworkNode) {
    const toEdgeMap = this.#edges.get(from);
    if (toEdgeMap == null) {
      throw new Error("edge out don't exist");
    }

    const edge = this.#removeEdgeTo(toEdgeMap, to);
    if (edge == null) {
      throw new Error("failed to remove edge?");
    }

    const fromController = this.#nodeControllers.get(from);
    if (fromController == null) {
      throw new Error(`how is there not a controller for node ${from.name}`);
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
    if (this.#agentPositions.get(agent) != null) {
      throw new Error(`Agent ${agent.name} is already in the network`);
    }

    if (!this.#nodeControllers.has(node)) {
      throw new Error(`Node ${node.name} ain't in the network`);
    }

    this.#reassignAgentNode(agent, null, node);

    agent.networkClient = this.#makeNetworkClient(agent);

    this.#emit({ type: "addagent", agent, node });
    this.#emit({ type: "agententer", agent, node });
    this.#agentsSubject.next([...this.getAgents(), agent]);
  }

  getAgentEvents(agent: Agent): Observable<events.NetworkAgentEvent> {
    let events$ = this.#agentEventsMap.get(agent);

    if (events$ == null) {
      events$ = this.agentEvents$.pipe(filter((ev) => ev.agent === agent));
      this.#agentEventsMap.set(agent, events$);
    }

    return events$;
  }

  getAgentNode(agent: Agent): NetworkNode | undefined {
    return this.#agentPositions.get(agent);
  }

  /** throws if move is invalid. */
  validateMoveAgent(agent: Agent, edge: NetworkEdge) {
    // TODO: is this needed?
    const toNode = edge.to;
    const agentPosition = this.#agentPositions.get(agent);

    if (agentPosition == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    if (agentPosition !== edge.from) {
      throw new Error(`Agent ${agent.name} can't cross edge ${edge.name} from node ${agentPosition}`);
    }

    // TODO: actually shouldn't this be comparing `edge` to the contents of the edge map?
    const edgeExists = this.hasEdge(agentPosition, toNode);

    if (!edgeExists) {
      throw new Error(`ain't no edge from ${agentPosition.name} to ${toNode.name}`);
    }
  }

  #moveAgent(agent: Agent, edgeController: NetworkEdgeController) {
    const edge = edgeController.edge;
    this.validateMoveAgent(agent, edge);

    const { from, to } = edge;

    this.#reassignAgentNode(agent, from, to);

    edgeController.fromController.emit({ type: "agentexit", agent });
    edgeController.emit({ type: "agentcross", agent });
    edgeController.toController.emit({ type: "agententer", agent });
  }

  removeAgent(agent: Agent) {
    const fromNode = this.#agentPositions.get(agent);
    if (fromNode == null) {
      throw new Error(`Agent ${agent.name} ain't here`);
    }

    this.#reassignAgentNode(agent, fromNode, null);

    this.#emit({ type: "agentexit", node: fromNode, agent });
    this.#emit({ type: "removeagent", agent });
    this.#agentsSubject.next(this.getAgents().filter((agent_) => agent_ !== agent));
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
      const agentsSubject = this.#getAgentsSubject(removeFromNode);

      if (agentsSubject == null) {
        throw new Error("where's the agents");
      }

      agentsSubject.next(
        agentsSubject.getValue()
          .filter((nodeAgent) => nodeAgent !== agent)
      );
    }

    if (addToNode != null) {
      const agentsSubject = this.#getAgentsSubject(addToNode);

      if (agentsSubject == null) {
        throw new Error("where's the agents");
      }

      agentsSubject.next([...agentsSubject.getValue(), agent]);

      this.#agentPositions.set(agent, addToNode);
    }
    else if (removeFromNode == null) {
      throw new Error("why reassign to and from null???");
    }
    else {
      this.#agentPositions.delete(agent);

    }
  }

  /**
   * Make a `NetworkClient` "network interface device" for an agent (or something else, i guess)
   */
  #makeNetworkClient<T>(client: T): NetworkClient<T> {
    if (!(client instanceof Agent)) {
      throw new Error("not ready for clients that aren't agents");
    }

    const request = (req: NetworkRequest) => this.#handleAgentRequest(client, req);

    return { client, request };
  }

  #handleAgentRequest(agent: Agent, request: NetworkRequest): NetworkResponse {
    try {
      if (isMove(request)) {
        const agentPositionNode = this.#agentPositions.get(agent);
        if (agentPositionNode == null) {
          throw new Error(`couldn't find agent ${agent.name}`);
        }

        const nodeController = this.#nodeControllers.get(agentPositionNode);
        if (nodeController == null) {
          throw new Error(`couldn't find controller for node ${agentPositionNode.name}`);
        }

        const edge = nodeController.edgesOutByName.get(request.edgeName);

        if (edge == null) {
          // maybe don't throw; return a "fu" response instead.
          // then add a callback to kill the agent if config.kill is true
          throw new Error(`no edge out of ${agentPositionNode.name} with name ${request.edgeName}`);
        }

        const edgeController = this.#edgeControllers.get(edge);
        if (edgeController == null) {
          throw new Error(`how is there not a controller for edge ${edge.name}`);
        }

        const callback = () => {
          this.#moveAgent(agent, edgeController);
        };
        this.#pendingRequestCallbacks.push(callback);
        return { status: "ok" };
      }

      throw new Error(`can't handle ${request.type} request`);
    } catch (error) {
      return responseFromError(error);
    }
  }
}
