import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { Color, Quaternion, Vector3 } from "three";
import { L3xError, NotImplementedError } from "@/model/errors";
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

// TODO: extract to module
// TODO: can i constrain T to be something springable?
// TODO: actually maybe it's the UI component's job to translate from THREE stuff to react-spring stuff
export class Animation<AnimatedValue> {
  constructor(
    public target: AnimatedValue,
    public duration: number = 0,
    public start: number = 0,
  ) {
  }
}

export class NetworkObjectView {
  #positionAnimationSubject: BehaviorSubject<Animation<Vector3>>;
  #colorAnimationSubject: BehaviorSubject<Animation<Color>>;
  #rotationAnimationSubject: BehaviorSubject<Animation<number>>;
  #upAxisAnimationSubject: BehaviorSubject<Animation<Vector3>>;

  positionAnimation$: Observable<Animation<Vector3>>;
  colorAnimation$: Observable<Animation<Color>>;
  rotationAnimation$: Observable<Animation<number>>;
  upAxisAnimation$: Observable<Animation<Vector3>>;

  constructor(
    position: Vector3,
    color: Color,
    rotation: number,
    upAxis: Vector3,
    public eventSubscriptions: Subscription[] = [],
  ) {
    this.#positionAnimationSubject = new BehaviorSubject(new Animation(position));
    this.#colorAnimationSubject = new BehaviorSubject(new Animation(color));
    this.#rotationAnimationSubject = new BehaviorSubject(new Animation(rotation));
    this.#upAxisAnimationSubject = new BehaviorSubject(new Animation(upAxis));

    this.positionAnimation$ = this.#positionAnimationSubject.asObservable();
    this.colorAnimation$ = this.#colorAnimationSubject.asObservable();
    this.rotationAnimation$ = this.#rotationAnimationSubject.asObservable();
    this.upAxisAnimation$ = this.#upAxisAnimationSubject.asObservable();
  }

  popupMessage(text: string) {
    throw new NotImplementedError();
  }

  getPositionAnimation() {
    return this.#positionAnimationSubject.getValue();
  }

  getColorAnimation() {
    return this.#colorAnimationSubject.getValue();
  }

  getRotationAnimation() {
    return this.#rotationAnimationSubject.getValue();
  }

  getUpAxisAnimation() {
    return this.#upAxisAnimationSubject.getValue();
  }

  animatePositionTo(position: Vector3, duration: number) {
    const start = 0; // TODO: is `start` even necessary?
    this.#positionAnimationSubject.next({ target: position, start, duration });
  }

  animateColorTo(color: Color, duration: number) {
    const start = 0; // TODO;
    this.#colorAnimationSubject.next({ target: color, start, duration });
  }

  animateRotationTo(rotation: number, duration: number) {
    const start = 0; // TODO;
    this.#rotationAnimationSubject.next({ target: rotation, start, duration });
  }

  animateUpAxisTo(upAxis: Vector3, duration: number) {
    this.#upAxisAnimationSubject.next({ target: upAxis, start: 0, duration });
  }
}

export class AgentView extends NetworkObjectView {
  constructor(
    public agent: Agent,
    position: Vector3,
    color: Color,
    rotation: number = 0,
    upAxis: Vector3 = new Vector3(0, 1, 0),
    eventSubscriptions: Subscription[] = []
  ) {
    super(position, color, rotation, upAxis, eventSubscriptions);
  }
}

export class NetworkNodeView extends NetworkObjectView {
  constructor(
    public node: NetworkNode,
    position: Vector3,
    color: Color,
    rotation: number = 0,
    upAxis: Vector3 = new Vector3(0, 1, 0),
    eventSubscriptions: Subscription[] = []
  ) {
    super(position, color, rotation, upAxis, eventSubscriptions);
  }
}

export class NetworkEdgeView extends NetworkObjectView {
  constructor(
    public edge: NetworkEdge,
    // TODO: geez do we really need to pass these in...
    // well, to know endpoint position updates, i think so
    public fromNodeView: NetworkNodeView,
    public toNodeView: NetworkNodeView,
    color: Color,
    eventSubscriptions: Subscription[] = []
  ) {
    const position = fromNodeView.getPositionAnimation().target;
    const rotation = 0;
    const upAxis = new Vector3(0, 1, 0);
    super(position, color, rotation, upAxis, eventSubscriptions);
  }
}

