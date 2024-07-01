import { BehaviorSubject, Observable, Subject, filter } from "rxjs";

import { L3xObject } from "@/model/L3xObject";
import { NotImplementedError } from "@/model/errors";
import { Agent } from "@/model/agent";
import { SequentialAgentEvent } from "@/model/agent/events";
import * as events from "./events";
import { NetworkClient, NetworkRequest, NetworkResponse, isMove as isMoveRequest, responseFromError } from "./NetworkClient";
import { AgentNotFoundError, BadRequestError, InvalidOperationError, ReservedNameError } from "./errors";
import { NetworkNode } from "./NetworkNode";
import { NetworkEdge } from "./NetworkEdge";

export interface NetworkNodeProps {
  // TODO: use type for constructor args for node?
  id?: number;
  name?: string;
  store?: unknown;
  agents?: Agent[];
  edges?: NetworkEdge[];
}

export interface NetworkEdgeProps {
  id?: number;
  name?: string;
  store?: unknown;
  from: NetworkNode;
  to: NetworkNode;
  key: string;
}

export interface NetworkAgentController {
  agent: Agent;
  occupiedNode: NetworkNode;
  networkAgentEvents$: Observable<events.NetworkAgentEvent>;
  emit: (event: events.NetworkEvent) => void;
}

/**
 * Nested map for looking up edges based on which nodes they connect and what
 * their key is.
 */
type EdgeIndex = Map<NetworkNode, EdgesByKeyMap>;

/**
 * Map a key to an edge with that key
 */
type EdgesByKeyMap = Map<string, NetworkEdge>;

export interface NetworkConfig {
  killOnBadRequest: boolean;
  logEvents: boolean;
}

const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  killOnBadRequest: true,
  logEvents: false,
};

export class Network extends L3xObject {
  readonly config: NetworkConfig;
  readonly eventLog = new Array<events.SequentialNetworkEvent>();
  readonly nodesByName = new Map<string, NetworkNode>(); // TODO: make private
  readonly edgesByName = new Map<string, NetworkEdge>();
  readonly agentsByName = new Map<string, Agent>();

  /**
   * `Subject` for all network events
   * 
   * The "observer" side of the subject is private so that only this network can send events through it.
   *
   * Serves as an event bus for event sources inside the network (nodes, agents, edges).
   */
  readonly #eventSubject = new Subject<events.SequentialNetworkEvent>;

  /** Map agents to these controller thingies that store where they are in the network */
  readonly #agentControllers = new Map<Agent, NetworkAgentController>();

  /** Public `Observable` for all network events */
  readonly events$: Observable<events.SequentialNetworkEvent> = this.#eventSubject.asObservable();
  /** Public `Observable` for network events related to nodes */
  readonly nodeEvents$: Observable<events.NetworkNodeEvent> = this.events$.pipe(filter(events.isAboutNode));
  /** Public `Observable` for network events related to edges */
  readonly edgeEvents$: Observable<events.NetworkEdgeEvent> = this.events$.pipe(filter(events.isAboutEdge));
  /** Public `Observable` for network events related to agents */
  readonly agentEvents$: Observable<events.NetworkAgentEvent> = this.events$.pipe(filter(events.isAboutAgent));

  readonly #nodesSubject = new BehaviorSubject(new Array<NetworkNode>());
  readonly #agentsSubject = new BehaviorSubject(new Array<Agent>());

  /** Public `Observable` for the collection of nodes in the network */
  readonly nodes$: Observable<NetworkNode[]> = this.#nodesSubject.asObservable();
  /** Public `Observable` for the collection of agents in the network */
  readonly agents$: Observable<Agent[]> = this.#agentsSubject.asObservable();

  /** Map nodes to their edges out; map keys to their edges */
  readonly #edgeIndex: EdgeIndex = new Map();

  #clockCount: number = 0;
  #nextEventId: number = 0;
  #nextNodeId: number = 0;
  #nextEdgeId: number = 0;

  #pendingRequestCallbacks: (() => void)[] = [];

  constructor(public name: string, config: Partial<NetworkConfig> = {}) {
    super("network", name);
    console.log(`creating network ${name}`);
    const fullConfig: NetworkConfig = { ...DEFAULT_NETWORK_CONFIG, ...config };
    this.config = fullConfig;
  }

  get clockCount() {
    return this.#clockCount;
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

    this.#clockCount += 1;
  }

  dumpState() {
    throw new NotImplementedError();
    // TODO: right now this is just for the purpose of rendering to a mermaid chart
    // but will want to handle full serialization (and remove circular references)

    // const edges = [...this.#edgeIndex.values()].flatMap((edgeMap) => [...edgeMap.values()]);
    // const agentPositions = [...this.#agentControllers.entries()];
    //
    // const state = {
    //   nodes: [...this.#nodesSubject.getValue()],
    //   edges,
    //   agentPositions
    // };
    //
    // return state;
  }

  addNode(nodeProps: NetworkNodeProps = {}): NetworkNode {
    // TODO: deal with "stores"???
    let { id, name, store, agents, edges } = nodeProps;

    if (id == null) {
      id = this.#nextNodeId++;
    }

    if (name == null) {
      name = `@n${id}`;
    } else if (name?.startsWith("@")) {
      throw new ReservedNameError(name);
    }

    if (this.nodesByName.has(name)) {
      throw new InvalidOperationError(`Network ${this.name} already has node ${name}`);
    }

    const node = new NetworkNode(id, name, store, agents, edges);

    this.nodesByName.set(name, node);
    this.#nodesSubject.next([...this.#nodesSubject.getValue(), node]);

    node.events$.subscribe((ev) => this.#emit(ev));  // forward all events up to the network
    this.#emit({ type: "addnode", node });

    return node;
  }

  removeNode(node: NetworkNode) {
    const existingNode = this.nodesByName.get(node.name);
    // TODO: is this helping?? i guess it'd suck if you didn't catch it before doing things
    if (node !== existingNode) {
      const msg = `Node to remove is not the same as this network's node by the same name: ${existingNode}`;
      throw new InvalidOperationError(msg);
    }

    node.getAgents().forEach((agent) => {
      this.removeAgent(agent);
    });

    this.#edgeIndex.delete(node);
    this.#nodesSubject.next(this.#nodesSubject.getValue().filter((_node) => _node !== node));
    this.nodesByName.delete(node.name);

    this.#emit({ type: "removenode", node });
  }

  addEdge(edgeProps: NetworkEdgeProps): NetworkEdge {
    let { id, name, store, from, to, key } = edgeProps;

    if (id == null) {
      id = this.#nextEdgeId++;
    }

    if (name == null) {
      name = `@e${id}`;
    } else if (name?.startsWith("@")) {
      throw new ReservedNameError(name);
    }

    if (this.edgesByName.has(name)) {
      throw new InvalidOperationError(`Edge already exists with name ${name}`);
    }

    let edgesOut = this.#edgeIndex.get(from);
    if (edgesOut == null) {
      edgesOut = new Map();
      this.#edgeIndex.set(from, edgesOut);
    }

    if (edgesOut.has(key)) {
      throw new InvalidOperationError(`Edge already exists with key ${key} from ${from.name} to ${to.name}`);
    }

    const edge = new NetworkEdge(id, name, store, from, to, key);

    this.edgesByName.set(name, edge);
    edgesOut.set(key, edge);
    from.addEdgeOut(edge);

    edge.events$.subscribe((ev) => this.#emit(ev));
    this.#emit({ type: "addedge", edge });

    return edge;
  }

  removeEdge(edgeProps: NetworkEdgeProps): void {
    const { from, key } = edgeProps;
    const edgesOut = this.#edgeIndex.get(from);
    const edge = edgesOut?.get(key);

    if (edge == null) {
      throw new InvalidOperationError(`Edge from ${from.name} with key ${key} doesn't exist`);
    }

    edgesOut!.delete(key);
    from.removeEdgeOut(edge);
    this.edgesByName.delete(edge.name);
    this.#emit({ type: "removeedge", edge });
  }

  getAgents(): Agent[] {
    return this.#agentsSubject.getValue();
  }

  getAgentController(agent: Agent): NetworkAgentController {
    const agentController = this.#agentControllers.get(agent);
    if (agentController == null) {
      throw new AgentNotFoundError(agent);
    }

    return agentController;
  }

  getAgentEvents(agent: Agent): Observable<events.NetworkAgentEvent> {
    const agentEvents$ = this.getAgentController(agent).networkAgentEvents$;

    return agentEvents$;
  }

  getAgentNode(agent: Agent): NetworkNode | undefined {
    return this.getAgentController(agent).occupiedNode;
  }

  /** Join an agent to the network on the given node */
  joinAgent(agent: Agent, node: NetworkNode): void {
    if (this.#agentControllers.get(agent) != null) {
      throw new InvalidOperationError(`Agent ${agent.name} is already in the network`);
    }

    if (this.agentsByName.get(agent.name) != null) {
      throw new InvalidOperationError(`Agent with name ${agent.name} is already in the network`);
    }

    const networkAgentEventsSubject = new Subject<events.NetworkAgentEvent>();
    function forwardAgentEvent(ev: SequentialAgentEvent) {
      networkAgentEventsSubject.next({ type: "agentemit", agent, emitted: ev });
    }

    agent.events$.subscribe(forwardAgentEvent);

    const agentController: NetworkAgentController = {
      agent,
      occupiedNode: node,
      networkAgentEvents$: networkAgentEventsSubject.asObservable(),
      emit: (ev) => networkAgentEventsSubject.next({ ...ev, agent })
    };

    networkAgentEventsSubject.subscribe((ev) => this.#emit(ev));

    this.#agentControllers.set(agent, agentController);
    this.agentsByName.set(agent.name, agent);

    agent.networkClient = this.#makeNetworkClient(agent);

    agentController.emit({ type: "addagent", node });
    node.addAgent(agent);
    this.#agentsSubject.next([...this.getAgents(), agent]);
  }

  /** throws if move is invalid. */
  #validateMoveAgent(agentController: NetworkAgentController, edge: NetworkEdge) {
    const agentPosition = agentController.occupiedNode;

    if (agentPosition !== edge.from) {
      throw new BadRequestError(`Agent ${agentController.agent.name} is at node ${agentPosition.name} but edge ${edge.name} leads out of node ${edge.from.name}`);
    }
  }

  #moveAgent(agentController: NetworkAgentController, edge: NetworkEdge) {
    this.#validateMoveAgent(agentController, edge);
    edge.handleAgentCross(agentController.agent);
    agentController.occupiedNode = edge.to;
    agentController.emit({ type: "agentmove", edge });
  }

  removeAgent(agent: Agent) {
    const agentController = this.getAgentController(agent);

    agentController.emit({ type: "removeagent" });

    this.#agentControllers.delete(agent);
    this.#agentsSubject.next(this.getAgents().filter((agent_) => agent_ !== agent));
  }

  /**
   * Make a `NetworkClient` "network interface device" for an agent (or something else, i guess)
   */
  #makeNetworkClient<T>(client: T): NetworkClient<T> {
    if (!(client instanceof Agent)) {
      throw new NotImplementedError("not ready for clients that aren't agents");
    }

    const agentController = this.getAgentController(client);

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
    const node = agentController.occupiedNode;

    if (isMoveRequest(request)) {
      const edge = this.#edgeIndex.get(node)?.get(request.edgeKey);

      if (edge == null) {
        throw new BadRequestError(`no edge out of ${node.name} with key ${request.edgeKey}`);
      }

      const callback = () => {
        this.#moveAgent(agentController, edge);
      };

      this.#pendingRequestCallbacks.push(callback);
      return { status: "ok" };
    }

    throw new NotImplementedError(`can't handle ${request.type} request`);
  }
}
