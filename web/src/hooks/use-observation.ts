import * as React from "react";

import { Observable } from "rxjs";

export interface UseObservationOpts {
  onError?: (err: Error) => void;
}

export function useObservation<T>(observable: Observable<T>): T | undefined;
export function useObservation<T>(
  factory: () => Observable<T>,
  deps?: any[],
  opts?: UseObservationOpts
): T | undefined;
export function useObservation<T>(
  observableOrFactory: Observable<T> | (() => Observable<T>),
  deps?: any[],
  opts?: UseObservationOpts
) {
  const [err, setErr] = React.useState<Error | undefined>(undefined);
  const factory = React.useMemo(
    () =>
      typeof observableOrFactory === "function"
        ? observableOrFactory
        : () => observableOrFactory,
    deps ? [...deps] : [observableOrFactory]
  );

  const [value, setValue] = React.useState<T | undefined>(undefined);

  // Using LayoutEffect guarentees we get a value before render.
  // This is useful when we know the observable is warmed up and we want the value on the very first render.
  React.useLayoutEffect(() => {
    const sub = factory().subscribe({
      next: (value) => setValue(value),
      error: opts?.onError ?? setErr,
    });
    return () => sub.unsubscribe();
  }, [opts?.onError ?? "undef", factory]);

  if (err) {
    throw err;
  }

  return value;
}
