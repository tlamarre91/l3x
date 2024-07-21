import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { Color } from "three";
import { L3xError } from "@/model/errors";
import { ArrayVector3 } from "@/model/types";
import { Agent } from "@/model/agent";

import { NetworkNode } from "./NetworkNode";
import { NetworkEdge } from "./NetworkEdge";

export class NetworkNodeViewNotFoundError extends L3xError {
  name = "NetworkNodeViewNotFoundError";

  constructor(
    public node: NetworkNode
  ) {
    super(`View not found for node ${node.name}`);
  }
}
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

    // const agentSubscription
  }
}

export class NetworkEdgeView extends NetworkObjectView {
  // TODO: simplify
  constructor(
    public edge: NetworkEdge,
    public fromNodeView: NetworkNodeView,
    public toNodeView: NetworkNodeView,
    color: Color,
    eventSubscriptions: Subscription[] = []
  ) {

    // function animatePosition(
    //   fromPositionAnimation: Animation<ArrayVector3>,
    //   toPositionAnimation: Animation<ArrayVector3>,
    // ) {
    //   console.log({
    //     fromPositionAnimation,
    //     toPositionAnimation
    //   });
    // }
    //
    // const newSubscriptions = [
    //   fromNodeView.positionAnimation$.subscribe(
    //     (fromPositionAnimation) => animatePosition(fromPositionAnimation, toNodeView.getPositionAnimation())
    //   ),
    //   toNodeView.positionAnimation$.subscribe(
    //     (toPositionAnimation) => animatePosition(fromNodeView.getPositionAnimation(), toPositionAnimation)
    //   ),
    // ];
    //
    // eventSubscriptions = [...eventSubscriptions, ...newSubscriptions];
    //
    // const position = [0, 0, 0] as const; // TOOD! yes tood

    const position = fromNodeView.getPositionAnimation().target;
    super(position, color, eventSubscriptions);
  }
}

