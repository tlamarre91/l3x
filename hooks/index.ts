import { useEffect, useState } from "react";
import { Observable } from "rxjs";

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
