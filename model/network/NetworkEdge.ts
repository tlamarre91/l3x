import { Subject } from "rxjs";
import { Agent } from "@/model/agent";
import { NetworkEvent, NetworkEdgeEvent } from "./events";
import { NetworkNode } from "./NetworkNode";

export class NetworkEdge {
  readonly type = "edge";

  #eventSubject = new Subject<NetworkEdgeEvent>();
  readonly events$ = this.#eventSubject.asObservable();

  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly store: unknown,
    public readonly from: NetworkNode,
    public readonly to: NetworkNode,
    public readonly key: string,
  ) {
  }

  #emit(ev: NetworkEvent) {
    this.#eventSubject.next({ ...ev, edge: this });
  }

  handleAgentCross(agent: Agent) {
    this.from.removeAgent(agent);
    this.#emit({ type: "agentcross", agent });
    this.to.addAgent(agent);
  }
}

