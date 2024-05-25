import { inject, injectable, singleton } from "microinject";

import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from "rxjs";

import { useDIDependency } from "@/container";

import { promiseToLoadingBehaviorObservable } from "@/observables";

import { useObservation } from "@/hooks/use-observation";

import { StationeersApi } from "../stationeers/StationeersApi";
import { DeviceApiObject } from "../stationeers/api-types";

@injectable()
@singleton()
export class HmiContext {
  private readonly _displayReferenceId$ = new BehaviorSubject<string | null>(
    null
  );
  private readonly _display$: Observable<DeviceApiObject | null | undefined>;

  constructor(@inject(StationeersApi) private readonly _api: StationeersApi) {
    this._display$ = this._displayReferenceId$.pipe(
      switchMap((id) =>
        id
          ? promiseToLoadingBehaviorObservable(this._api.getDevice(id))
          : Promise.resolve(null)
      ),
      shareReplay(1)
    );
  }

  setDisplayReferenceId(id: string | null) {
    this._displayReferenceId$.next(id);
  }

  get displayReferenceId$() {
    return this._displayReferenceId$;
  }

  get display$() {
    return this._display$;
  }

  private _dataNetworkId$: Observable<string | null> | null = null;
  get dataNetworkId$() {
    if (!this._dataNetworkId$) {
      this._dataNetworkId$ = this.display$.pipe(
        map((display) => display?.dataNetworkId ?? null),
        distinctUntilChanged(),
        shareReplay(1)
      );
    }
    return this._dataNetworkId$;
  }
}

export function useHmiDisplay() {
  const context = useDIDependency(HmiContext);
  return useObservation(context.display$);
}
