import { DependencyList, useCallback, useEffect, useState } from "react";
import { Observable } from "rxjs";

/** Set an event listener on the DOM */
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
  }, [listener, ...dependencies]);
}

/** Set an event listener for changes to the fragment component of the URL */
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

/** Set a listener for changes to an RxJS observable */
export function useSubscription<T>(
  observable$: Observable<T>,
  handler: (t: T) => void,
  dependencies: DependencyList = []
) {
  useEffect(() => {
    const subscription = observable$.subscribe(handler);
    return () => subscription.unsubscribe();
  }, [observable$, handler, ...dependencies]);
}

/** Wrap `React.useState` with a listener for changes to an RxJS observable */
export function useStateSubscription<T>(
  observable$: Observable<T>,
  initialValue: T | (() => T),
  dependencies: DependencyList = []
) {
  const [state, setState] = useState<T>(initialValue);
  useSubscription(observable$, setState, dependencies);
  return state;
}

// TODO: export function useReducerSubscription<T>
// TODO: export function useBehaviorSubjectSubscription<T> that just wraps useStateSubscription
