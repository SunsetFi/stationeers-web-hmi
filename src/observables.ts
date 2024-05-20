import { Observable, Subscription, distinctUntilChanged } from "rxjs";

import { arrayShallowEquals } from "./utils";

export function distinctUntilShallowArrayChanged() {
  return <T>(source: Observable<readonly T[]>): Observable<readonly T[]> => {
    return source.pipe(distinctUntilChanged(arrayShallowEquals));
  };
}

export function observeAll() {
  return <K>(source: Observable<readonly Observable<K>[]>) => {
    return new Observable<K[]>((subscriber) => {
      const subscriberMap = new Map<
        Observable<K>,
        { subscription: Subscription; lastValue: K | undefined }
      >();
      let lastValues: readonly Observable<K>[] = [];
      let isSubscribing = false;

      function tryEmitValues() {
        if (isSubscribing) {
          return;
        }

        const values = lastValues.map(
          (value) => subscriberMap.get(value)?.lastValue
        );

        if (values.some((value) => value === undefined)) {
          return;
        }

        // In practice this is called a bonkers number of times even after we get all values.
        // Books page does this particularly... Need a distinct somewhere?
        subscriber.next(values as any);
      }

      function subscribeToChild(observable: Observable<K>) {
        const values = {
          subscription: undefined as any,
          lastValue: undefined as K | undefined,
        };

        // This must be set before we subscribe as cold observables will give us a value immediately.
        subscriberMap.set(observable, values);
        values.subscription = observable.subscribe({
          next: (value) => {
            values.lastValue = value;
            tryEmitValues();
          },
          error: (err) => {
            subscriber.error(err);
          },
          // Don't care about complete, it will stick to its last value forever.
          // Note: If we never got a value, we will be stuck waiting for the undefined value forever.... maybe do something about that.
        });
      }

      function trySubscribe(observable: Observable<K>) {
        if (!subscriberMap.has(observable)) {
          subscribeToChild(observable);
          return true;
        }

        return false;
      }

      function clearOldSubscriptions(values: readonly Observable<K>[]) {
        let cleared = 0;
        for (const [observable, { subscription }] of subscriberMap.entries()) {
          if (!values.includes(observable)) {
            cleared++;
            subscription.unsubscribe();
            subscriberMap.delete(observable);
          }
        }
        return cleared > 0;
      }

      function onTopLevelUpdate(values: readonly Observable<K>[]) {
        let emit = false;
        try {
          isSubscribing = true;

          emit = clearOldSubscriptions(values);
          for (const value of values) {
            if (trySubscribe(value)) {
              emit = true;
            }
          }

          lastValues = values;
        } finally {
          isSubscribing = false;
        }

        if (emit || values.length === 0) {
          tryEmitValues();
        }
      }

      const topLevelSubscription = source.subscribe({
        next: onTopLevelUpdate,
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      return () => {
        for (const { subscription } of subscriberMap.values()) {
          subscription.unsubscribe();
        }

        topLevelSubscription.unsubscribe();
      };
    });
  };
}
