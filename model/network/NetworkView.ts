import { BehaviorSubject, Observable, Subscription } from "rxjs";

import { Network } from "./Network";
import { NetworkNode } from "./NetworkNode";
import { Agent } from "@/model/agent";
import * as events from "./events";
import { Color } from "three";
import { NetworkEdge } from "./NetworkEdge";

type ArrayVector3 = readonly [number, number, number];
// TODO: probably need one of these for Color too; i think spring expects strings

// TODO: extract to module
// TODO: can i constrain T to be something springable?
export class Animation<T> {
  constructor(
    public target: T,
    public duration: number = 0,
    public start: number = 0,
  ) {
  }
}

export class NetworkObjectView {
  #positionAnimationSubject: BehaviorSubject<Animation<ArrayVector3>>;
  #colorAnimationSubject: BehaviorSubject<Animation<Color>>;

  positionAnimation$: Observable<Animation<ArrayVector3>>;
  colorAnimation$: Observable<Animation<Color>>;

  constructor(position: ArrayVector3, color: Color, public eventSubscriptions: Subscription[] = []) {
    this.#positionAnimationSubject = new BehaviorSubject(new Animation(position));
    this.#colorAnimationSubject = new BehaviorSubject(new Animation(color));

    this.positionAnimation$ = this.#positionAnimationSubject.asObservable();
    this.colorAnimation$ = this.#colorAnimationSubject.asObservable();
  }

  getPositionAnimation() {
    return this.#positionAnimationSubject.getValue();
  }

  getColorAnimation() {
    return this.#colorAnimationSubject.getValue();
  }

  animatePositionTo(position: ArrayVector3, duration: number) {
    const start = 0; // TODO: is `start` even necessary?
    this.#positionAnimationSubject.next({ target: position, start, duration });
  }

  animateColorTo(color: Color, duration: number) {
    const start = 0; // TODO;
    this.#colorAnimationSubject.next({ target: color, start, duration });
  }
}

export class AgentView extends NetworkObjectView {
  constructor(
    public agent: Agent,
    position: ArrayVector3,
    color: Color,
    eventSubscriptions: Subscription[] = []
  ) {
    super(position, color, eventSubscriptions);
  }
}

export class NetworkNodeView extends NetworkObjectView {
  constructor(
    public node: NetworkNode,
    position: ArrayVector3,
    color: Color,
    eventSubscriptions: Subscription[] = []
  ) {
    super(position, color, eventSubscriptions);
  }
}

export class NetworkEdgeView extends NetworkObjectView {
  constructor(
    public edge: NetworkEdge,
    position: ArrayVector3,
    color: Color,
    eventSubscriptions: Subscription[] = []
  ) {
    super(position, color, eventSubscriptions);
  }
}

export class NetworkView {
  #agentViewsSubject = new BehaviorSubject(new Array<AgentView>());
  #nodeViewsSubject = new BehaviorSubject(new Array<NetworkNodeView>());
  #edgeViewsSubject = new BehaviorSubject(new Array<NetworkEdgeView>());
  #agentViewMap = new Map<Agent, AgentView>();
  #nodeViewMap = new Map<NetworkNode, NetworkNodeView>();
  #edgeViewMap = new Map<NetworkEdge, NetworkEdgeView>();

  agentViews$ = this.#agentViewsSubject.asObservable();
  nodeViews$ = this.#nodeViewsSubject.asObservable();
  edgeViews$ = this.#edgeViewsSubject.asObservable();

  constructor(
    public readonly network: Network,
    watch = true
  ) {
    if (watch) {
      this.watch();
    }
  }

  watch() {
    this.network.agentEvents$.subscribe((ev) => {
      // TODO: extract to handleAddAgent
      if (events.isAddAgent(ev)) {
        this.handleAddAgent(ev);
      }

      // TODO: extract to handleAddAgent
      if (events.isRemoveAgent(ev)) {
        // TODO: we done here?
        this.removeAgentView(ev.agent);
        return;
      }
    });

    // TODO:
    // this.network.edgeEvents$.subscribe((ev) => {
    //   if (events.isAddEdge(ev)) {
    //     this.handleAddEdge(ev);
    //   }
    //
    //   if (events.isRemoveEdge(ev)) {
    //     this.handleRemoveEdge(ev);
    //   }
    // });
  }

  getAgentViews() {
    return this.#agentViewsSubject.getValue();
  }

  handleAddAgent(ev: events.NetworkAgentEvent): void {
    const { agent, node } = ev;
    if (node == null) {
      throw new Error(`addagent event for ${agent.name} has no node??`);
    }

    const nodeView = this.#nodeViewMap.get(node);
    if (nodeView == null) {
      throw new Error(`view not found for node ${node.name}`);
    }

    const nodePosition = nodeView.getPositionAnimation().target;

    const agentView = new AgentView(agent, nodePosition, new Color(Color.NAMES.green));
    this.addAgentView(agentView);
  }

  handleRemoveAgent(ev: events.NetworkAgentEvent) {
  }

  getNodeViews() {
    return this.#nodeViewsSubject.getValue();
  }

  getAgentView(agent: Agent) {
    return this.#agentViewMap.get(agent);
  }

  #setAgentView(agent: Agent, agentView: AgentView) {
    this.#agentViewMap.set(agent, agentView);
    // TODO: think about how this works with large numbers of agents...
    this.#agentViewsSubject.next([...this.#agentViewMap.values()]);
  }

  addAgentView(agentView: AgentView): AgentView {
    // TODO: add pre-check for existence
    const agent = agentView.agent;
    this.#setAgentView(agent, agentView);

    // TODO: pass in some event handlers for the agent view instead of hardcoding
    const agentEvents$ = this.network.getAgentEvents(agent);
    const subscription = agentEvents$.subscribe((ev) => {
      // console.log({ ev });
      if (ev.type === "agentmove") {
        this.handleAgentMove(agent, ev.edge!.to);
        return;
      }
    });

    const otherSubscription = agent.executionStateObservables.alive$.subscribe(
      (aliveness) => !aliveness
        ? agentView.animatePositionTo([0, 0, -1000], 15000)
        : null
    );

    agentView.eventSubscriptions.push(subscription, otherSubscription);

    return agentView;
  }

  removeAgentView(agent: Agent) {
    const agentView = this.#agentViewMap.get(agent);
    if (agentView == null) {
      throw new Error(`Tried to delete missing view for agent ${agent.name} (id=${agent.id})`);
    }

    this.#agentViewMap.delete(agent);
    this.#agentViewsSubject.next([...this.#agentViewsSubject.getValue().filter((v) => v !== agentView)]);

    agentView.eventSubscriptions.forEach(sub => sub.unsubscribe());
  }

  getNetworkNodeView(node: NetworkNode) {
    return this.#nodeViewMap.get(node);
  }

  setNetworKNodeView(node: NetworkNode, nodeView: NetworkNodeView) {
    this.#nodeViewMap.set(node, nodeView);
    // TODO: think about how this works with large numbers of nodes...
    this.#nodeViewsSubject.next([...this.#nodeViewMap.values()]);
  }

  addNetworkNodeView(node: NetworkNode, nodeView: NetworkNodeView) {
    // TODO: add pre-check for existence
    this.setNetworKNodeView(node, nodeView);
    // TODO: pass in some event handlers for the node view
  }

  handleAgentMove(agent: Agent, toNode: NetworkNode) {
    const DURATION = 1500; // TODO
    const agentView = this.#agentViewMap.get(agent);
    const nodeView = this.#nodeViewMap.get(toNode);

    if (agentView == null || nodeView == null) {
      throw new Error(`missing view(s) for move: agent ${
        agent.name} (id=${
        agent.id}) to node ${
        toNode.name} (id=${
        toNode.id})`);
    }

    const nodePosition = nodeView.getPositionAnimation().target;

    agentView.animatePositionTo(nodePosition, DURATION);
  }
}
