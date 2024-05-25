import { inject, injectable, singleton } from "microinject";

import { BehaviorSubject, Observable, map, shareReplay, switchMap } from "rxjs";

import { StationeersApi } from "../stationeers/StationeersApi";
import { DeviceApiObject } from "../stationeers/api-types";
import {
  distinctUntilShallowArrayChanged,
  promiseToLoadingBehaviorObservable,
} from "@/observables";
import { useDIDependency } from "@/container";
import { useObservation } from "@/hooks/use-observation";

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

  private _cableNetworkIds$: Observable<readonly string[]> | null = null;
  get cableNetworkId$() {
    if (!this._cableNetworkIds$) {
      this._cableNetworkIds$ = this.display$.pipe(
        map((display) => display?.cableNetworkIds ?? []),
        distinctUntilShallowArrayChanged()
      );
    }
    return this._cableNetworkIds$;
  }
}

export function useHmiDisplay() {
  const context = useDIDependency(HmiContext);
  return useObservation(context.display$);
}
