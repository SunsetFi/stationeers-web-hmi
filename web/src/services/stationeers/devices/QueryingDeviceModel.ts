import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  shareReplay,
  switchMap,
} from "rxjs";
import { startTransition } from "react";
import { isEqual } from "lodash";

import { StationeersApi } from "../StationeersApi";
import {
  DeviceApiObject,
  DeviceQueryPayload,
  LogicValues,
  deviceMatchesQuery,
} from "../api-types";

import { DeviceModel } from "./DeviceModel";
import { NullDeviceModel } from "./NullDeviceModel";

/**
 * A device model that always represents the first device returned by a query.
 * When the device no longer matches the query, the model will attempt to resolve a new device that matches.
 * The query itself is observable, allowing for underlying conditions to change.
 */
export class QueryingDeviceModel implements DeviceModel {
  // FIXME: This model is constantly monitoring the game but has no teardown.
  // We need to track subscriptions and tear down our tracking once everyone unsubscribes.

  private readonly _resolved$: BehaviorSubject<DeviceModel>;
  private readonly _initialResolve: Promise<void>;
  private _onInitialResolve: (() => void) | null = null;

  private _currentQuery: DeviceQueryPayload | null = null;
  private _lastResolve: Promise<void> | null = null;
  private _scheduledResolve: Promise<void> | null = null;
  private _lastResolveTimestamp: number = 0;

  constructor(
    private readonly _query$: Observable<DeviceQueryPayload>,
    private readonly _api: StationeersApi,
    private readonly _resolveDataDeviceModel: (
      data: DeviceApiObject
    ) => DeviceModel,
    initialModel: DeviceModel = new NullDeviceModel()
  ) {
    this._resolved$ = new BehaviorSubject(initialModel);

    this._initialResolve = new Promise((resolve) => {
      this._onInitialResolve = resolve;
    });

    combineLatest([this.data$, this._query$]).subscribe(([data, query]) => {
      this._currentQuery = query;
      // Do not check for exists; it will be reflected in the bad data.
      // We need to not check for that as it may lag behind data and show false negatives.
      if (!deviceMatchesQuery(data, query)) {
        this._clear();
        this._scheduleResolve();
      } else {
        // We got data and it matches, so we are all happy.
        // This is a bit of an edge case hack, as if our initial model matches the query
        // we will not call scheduleResolve.
        if (this._onInitialResolve) {
          this._onInitialResolve();
          this._onInitialResolve = null;
        }
      }
    });
  }

  get _observed() {
    return this._resolved$.observed;
  }

  get exists(): boolean {
    return this._resolved$.value.exists;
  }

  private _exists$: Observable<boolean> | null = null;
  get exists$(): Observable<boolean> {
    if (!this._exists$) {
      this._exists$ = this._resolved$.pipe(
        switchMap((value) => value.exists$),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._exists$;
  }

  get referenceId(): string {
    return this._resolved$.value.referenceId;
  }

  get displayName(): string {
    return this._resolved$.value.displayName;
  }

  private _displayName$: Observable<string> | null = null;
  get displayName$(): Observable<string> {
    if (!this._displayName$) {
      this._displayName$ = this._resolved$.pipe(
        switchMap((value) => value.displayName$),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._displayName$;
  }

  get logicValues(): LogicValues {
    return this._resolved$.value.logicValues;
  }

  private _logicValues$: Observable<LogicValues> | null = null;
  get logicValues$(): Observable<LogicValues> {
    if (!this._logicValues$) {
      this._logicValues$ = this._resolved$.pipe(
        switchMap((value) => value.logicValues$),
        distinctUntilChanged(isEqual),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._logicValues$;
  }

  private _data$: Observable<DeviceApiObject> | null = null;
  get data$(): Observable<DeviceApiObject> {
    if (!this._data$) {
      this._data$ = this._resolved$.pipe(
        switchMap((value) => value.data$),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._data$;
  }

  writeLogicValue(key: string, value: number): Promise<void> {
    return this._resolved$.value.writeLogicValue(key, value);
  }

  awaitNextUpdate() {
    return this._resolved$.value.awaitNextUpdate();
  }

  _awaitInitialResolve(): Promise<void> {
    return this._initialResolve;
  }

  private _scheduleResolve() {
    if (this._scheduledResolve) {
      return;
    }

    // Wait on the current pending resolve before trying again, to avoid race conditions.
    // Resolve at most once per second.
    const timeSinceLastResolve = Date.now() - this._lastResolveTimestamp;
    this._scheduledResolve = (this._lastResolve ?? Promise.resolve()).then(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () => {
              this._scheduledResolve = null;
              this._lastResolve = this._resolveDevice().then(() => {
                this._lastResolveTimestamp = Date.now();
                resolve();
              });
            },
            Math.max(1000 - timeSinceLastResolve, 0)
          );
        })
    );
  }

  private async _resolveDevice() {
    if (this._currentQuery == null) {
      this._clear();
      this._scheduleResolve();
      return;
    }

    let resolvedData: DeviceApiObject | null = null;
    try {
      // TODO: If we were resolved to an item, we won't be needing it anymore.
      // However, since we registered it with DevicesSource, we are tracking it forever.
      // We need our items to delete themselves when they are no longer needed.
      [resolvedData] = await this._api.queryDevices(this._currentQuery);
    } catch (e: any) {
      console.error(
        `Error during device query for ${JSON.stringify(this._currentQuery)}: ${e.stack}`
      );
    }

    startTransition(() => {
      if (!resolvedData) {
        console.log("Could not find device", this._currentQuery);
        this._clear();
        this._scheduleResolve();
      } else {
        const model = this._resolveDataDeviceModel(resolvedData);
        console.log("Setting resolved next to", model);
        this._resolved$.next(model);

        console.log(
          "Resolved device",
          resolvedData,
          "to",
          model,
          ".  observable is",
          this._resolved$.value
        );

        if (this._onInitialResolve) {
          this._onInitialResolve();
          this._onInitialResolve = null;
        }
      }
    });
  }

  private _clear() {
    if (this._resolved$.value instanceof NullDeviceModel === false) {
      startTransition(() => {
        this._resolved$.next(new NullDeviceModel());
      });
    }
  }
}
