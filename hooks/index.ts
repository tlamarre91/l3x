import { DependencyList, useCallback, useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => void,
  dependencies: DependencyList,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    addEventListener(type, listener, options);

    return () => {
      removeEventListener(type, listener, options);
    };
  }, dependencies.concat(listener));
}

export function useFragmentId() {
  if (typeof window === "undefined") {
    return null;
  }

  const [fragmentId, setFragmentId] = useState<string | null>(null);

  const listener = useCallback(() => setFragmentId(window.location.hash), []);

  useEffect(() => {
    addEventListener("hashchange", listener);
    listener();
    return () => removeEventListener("hashchange", listener);
  }, []);

  return fragmentId;
}

export function useSubscription<T>(
  observable$: Observable<T>,
  handler: (t: T) => void,
) {
  useEffect(() => {
    const subscription = observable$.subscribe(handler);
    return () => subscription.unsubscribe();
  }, [observable$, handler]);
}

export function useStateSubscription<T>(
  observable$: Observable<T>,
  initialValue: T | (() => T),
) {
  const [state, setState] = useState<T>(initialValue);
  useSubscription(observable$, setState);
  return state;
}

// TODO: export function useReducerSubscription<T>
