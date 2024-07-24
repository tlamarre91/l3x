import { BehaviorSubject } from "rxjs";

import { Network } from "./Network";
import { NetworkNode } from "./NetworkNode";
import { Agent } from "@/model/agent";
import * as events from "./events";
import * as THREE from "three";
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

    const agentView = new AgentView(agent, nodePosition, new THREE.Color(THREE.Color.NAMES.green));
    this.addAgentView(agentView);
  }

  handleRemoveAgent(ev: events.NetworkAgentEvent) {
  }

  handleAddEdge(ev: events.NetworkEdgeEvent) {

    const { edge: { from, to } } = ev;
    const fromView = this.getNodeView(from);
    const fromPosition = fromView.getPositionAnimation().target;
    const toView = this.getNodeView(to);
    const toPosition = toView.getPositionAnimation().target;

    const edgeView = new NetworkEdgeView(
      ev.edge,
      fromView,
      toView,
      new THREE.Color(THREE.Color.NAMES.gold)
    );

    this.#edgeGroupIndex.add(from, to, edgeView);
    // TODO
  }

  handleRemoveEdge(ev: events.NetworkEdgeEvent) {

  }

  getNodeViews() {
    return this.#nodeViewsSubject.getValue();
  }

  getEdgeViews() {
    return this.#edgeViewsSubject.getValue();
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
      if (events.isAgentMove(ev)) {
        this.handleAgentMove(ev);
        return;
      }

      if (ev.type === "agentemit") { // TODO: add isAgentEmit
        this.handleAgentEmittedEvent(ev as events.AgentEmittedEvent);
        return;
      }
    });

    const otherSubscription = agent.executionStateObservables.alive$.subscribe(
      (aliveness) => !aliveness
        ? agentView.animatePositionTo(new THREE.Vector3(0, 0, -1000), 15000)
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

  #setEdgeView(edge: NetworkEdge, edgeView: NetworkEdgeView) {
    this.#edgeViewMap.set(edge, edgeView);
    // TODO: think about how this works with large numbers of edges...
    this.#edgeViewsSubject.next([...this.#edgeViewMap.values()]);
  }

  addEdgeView(edgeView: NetworkEdgeView): NetworkEdgeView {
    const edge = edgeView.edge;
    this.#setEdgeView(edge, edgeView);

    // TODO: more edge-view-adding stuff

    return edgeView;
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

  handleAgentMove(ev: events.AgentMoveEvent) {
    const {
      agent,
      edge: {
        to:
        toNode,
      }
    } = ev;

    const DURATION = 200; // TODO: :)
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

  // TODO: refactor!!
  handleAgentEmittedEvent(ev: events.AgentEmittedEvent) {
    console.log("handling emitted", ev);
    const {
      agent,
      emitted: {
        id,
        type,
        message
      }
    } = ev;

    const agentView = this.#agentViewMap.get(agent);

    if (agentView == null) {
      throw new Error("TODO: handle missing views gracefully");
    }

    function spinnySpin() {
      // const newRotation = new THREE.Quaternion();
      // newRotation.setFromEuler(new THREE.Euler(0, 1, 0));
      // newRotation.multiply(agentView!.getRotationAnimation().target)
      const r = Math.random() * 4;

      if (r < 1) {
        let newUpAxis = agentView!.getUpAxisAnimation().target;
        newUpAxis = new THREE.Vector3(newUpAxis.y, newUpAxis.x, newUpAxis.z)
        agentView!.animateUpAxisTo(newUpAxis, 500);
      } else {
        const newRotation = agentView!.getRotationAnimation().target + (Math.PI / 2);
        agentView!.animateRotationTo(newRotation, 500)
      }
    }

    switch (type) {
      case "error":
        spinnySpin();
        break;

      case "echo":
        
    }
  }
}
