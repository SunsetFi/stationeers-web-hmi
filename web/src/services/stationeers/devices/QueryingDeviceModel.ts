import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  shareReplay,
  switchMap,
} from "rxjs";
import { startTransition } from "react";

import { StationeersApi } from "../StationeersApi";
import {
  DeviceApiObject,
  DeviceQueryPayload,
  LogicValues,
  deviceMatchesQuery,
} from "../api-types";

import { DeviceModel } from "./DeviceModel";
import { NullDeviceModel } from "./NullDeviceModel";
import { isEqual } from "lodash";

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
  private _scheduledResolve: number | null = null;

  constructor(
    private readonly _query$: Observable<DeviceQueryPayload>,
    private readonly _api: StationeersApi,
    private readonly _resolveDataDeviceModel: (
      data: DeviceApiObject
    ) => DeviceModel
  ) {
    const nullModel: DeviceModel = new NullDeviceModel();
    this._resolved$ = new BehaviorSubject(nullModel);

    this._initialResolve = new Promise((resolve) => {
      this._onInitialResolve = resolve;
    });

    combineLatest([this.data$, this.exists$, this._query$]).subscribe(
      ([data, exists, query]) => {
        this._currentQuery = query;
        if (!exists || !deviceMatchesQuery(data, query)) {
          this._clear();
          this._resolveDevice();
        }
      }
    );
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
        shareReplay(1)
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
        shareReplay(1)
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
        shareReplay(1)
      );
    }

    return this._logicValues$;
  }

  private _data$: Observable<DeviceApiObject> | null = null;
  get data$(): Observable<DeviceApiObject> {
    if (!this._data$) {
      this._data$ = this._resolved$.pipe(
        switchMap((value) => value.data$),
        shareReplay(1)
      );
    }

    return this._data$;
  }

  _awaitInitialResolve(): Promise<void> {
    return this._initialResolve;
  }

  private _scheduleResolve() {
    // TODO: We should not do this or cancel this if nothing is subscribed to us.
    // As it is, we will keep trying forever if we cannot find the device by name.

    if (this._scheduledResolve) {
      clearTimeout(this._scheduledResolve);
    }

    this._scheduledResolve = setTimeout(() => {
      this._scheduledResolve = null;
      this._resolveDevice();
    }, 1000);
  }

  private async _resolveDevice() {
    if (this._scheduledResolve) {
      clearTimeout(this._scheduledResolve);
      this._scheduledResolve = null;
    }

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

    if (!resolvedData) {
      this._clear();
      this._scheduleResolve();
    } else {
      startTransition(() => {
        this._resolved$.next(this._resolveDataDeviceModel(resolvedData));
      });
    }

    if (this._onInitialResolve) {
      this._onInitialResolve();
      this._onInitialResolve = null;
    }
  }

  private _clear() {
    if (this._resolved$.value instanceof NullDeviceModel === false) {
      startTransition(() => {
        this._resolved$.next(new NullDeviceModel());
      });
    }
  }
}
