import { useEffect } from "react";
import { Observable } from "rxjs";

export function useSubscription<T>(
  observable$: Observable<T>,
  handler: (t: T) => void,
) {
  useEffect(() => {
    const subscription = observable$.subscribe(handler);
    return () => {
      subscription.unsubscribe();
    };
  }, [observable$, handler]);
}
