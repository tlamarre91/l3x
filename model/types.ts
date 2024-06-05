import { Observable } from "rxjs";

export type Sequential = {
  id: number;
}

export interface Positioned {
  position: readonly [number, number, number];
}

export type ObservableAndGetter<T> = readonly [Observable<T>, () => T];

export type ArrayVector3 = readonly [number, number, number];
