import { BehaviorSubject } from "rxjs";

import type { ArrayVector3 } from "@/model/types";
import { Network } from "./Network";
import { NetworkNode } from "./NetworkNode";
import { Agent } from "@/model/agent";
import * as events from "./events";
import { Color } from "three";
import { NetworkEdge } from "./NetworkEdge";
import { AgentView, NetworkEdgeView, NetworkNodeView, NetworkNodeViewNotFoundError } from "./NetworkObjectView";
import { EdgeGroupIndex } from "./EdgeGroupIndex";

export class NetworkView {
  #agentViewsSubject = new BehaviorSubject(new Array<AgentView>());
  #nodeViewsSubject = new BehaviorSubject(new Array<NetworkNodeView>());
  #edgeViewsSubject = new BehaviorSubject(new Array<NetworkEdgeView>());
  #agentViewMap = new Map<Agent, AgentView>();
  #nodeViewMap = new Map<NetworkNode, NetworkNodeView>();
  #edgeViewMap = new Map<NetworkEdge, NetworkEdgeView>();
  #edgeGroupIndex = new EdgeGroupIndex();

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

    this.network.edgeEvents$.subscribe((ev) => {
      if (events.isAddEdge(ev)) {
        this.handleAddEdge(ev);
      }

      if (events.isRemoveEdge(ev)) {
        this.handleRemoveEdge(ev);
      }
    });
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

  handleAddEdge(ev: events.NetworkEdgeEvent) {
    function midpoint(p1: ArrayVector3, p2: ArrayVector3): ArrayVector3 {
      const [x1, y1, z1] = p1;
      const [x2, y2, z2] = p2;

      return [
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        (z1 + z2) / 2,
      ];
    }

    const { edge: { from, to } } = ev;
    const fromView = this.getNodeView(from);
    const fromPosition = fromView.getPositionAnimation().target;
    const toView = this.getNodeView(to);
    const toPosition = toView.getPositionAnimation().target;

    const edgeView = new NetworkEdgeView(
      ev.edge,
      fromView,
      toView,
      new Color(Color.NAMES.gold)
    );

    this.#edgeGroupIndex.add(from, to, edgeView);
    // TODO
  }

  handleRemoveEdge(ev: events.NetworkEdgeEvent) {

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

  getNodeView(node: NetworkNode): NetworkNodeView {
    const view = this.#nodeViewMap.get(node);
    if (view == null) {
      throw new NetworkNodeViewNotFoundError(node);
    }

    return view;
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
