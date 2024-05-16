import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Agent } from "@/model/agent";
import { NetworkEvent, NetworkNodeEvent } from "./events";
import { NetworkEdge } from "./NetworkEdge";

export class NetworkNode {
  readonly type = "node";

  #eventSubject = new Subject<NetworkNodeEvent>();
  readonly events$ = this.#eventSubject.asObservable();

  #agentsSubject: BehaviorSubject<Array<Agent>>;
  readonly agents$: Observable<Array<Agent>>;

  #edgesOutSubject: BehaviorSubject<Array<NetworkEdge>>;
  readonly edgesOut$: Observable<Array<NetworkEdge>>;

  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly store: unknown,
    agents: Agent[] = [],
    edgesOut: NetworkEdge[] = [],
  ) {
    this.#agentsSubject = new BehaviorSubject(agents);
    this.#edgesOutSubject = new BehaviorSubject(edgesOut);
    this.agents$ = this.#agentsSubject.asObservable();
    this.edgesOut$ = this.#edgesOutSubject.asObservable();
  }

  #emit(ev: NetworkEvent): void {
    this.#eventSubject.next({ ...ev, node: this });
  }

  getAgents(): Agent[] {
    return this.#agentsSubject.getValue();
  }

  addAgent(agent: Agent): void {
    this.#agentsSubject.next([...this.getAgents(), agent]);
    this.#emit({ type: "agententer", agent });
  }

  removeAgent(agent: Agent): void {
    this.#agentsSubject.next(this.getAgents().filter((_agent) => _agent !== agent));
    this.#emit({ type: "agentexit", agent });
  }

  addEdgeOut(edge: NetworkEdge): void {
    this.#edgesOutSubject.next([...this.getEdgesOut(), edge]);
  }

  removeEdgeOut(edge: NetworkEdge): void{
    this.#edgesOutSubject.next(this.getEdgesOut().filter((_edge) => _edge !== edge));
  }

  getEdgesOut(): NetworkEdge[] {
    return this.#edgesOutSubject.getValue();
  }
}
