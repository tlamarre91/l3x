import { useEffect } from "react";
import { Observable } from "rxjs";

// TODO: handle pipelines that can change the type
export function useSubscription<T>(
  observable: Observable<T>,
  handler: (t: T) => void,
) {
  useEffect(() => {
    const subscription = observable.subscribe(handler);
    return subscription.unsubscribe.bind(subscription);
  }, [observable, handler]);
}
