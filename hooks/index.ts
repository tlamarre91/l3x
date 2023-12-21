import { useEffect } from "react";
import { Observable } from "rxjs";

export function useSubscription<T>(
  observable$: Observable<T>,
  handler: (t: T) => void,
) {
  useEffect(() => {
    console.log("subbin'");
    console.log(observable$, handler);
    const subscription = observable$.subscribe(handler);
    return () => {
      console.log("unsubbin'");
      subscription.unsubscribe();
    };
  }, [observable$, handler]);
}
