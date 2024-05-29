import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  shareReplay,
} from "rxjs";
import { isEqual } from "lodash";

import { cloneDeepFreeze } from "@/utils";

import { StationeersApi } from "../StationeersApi";
import { DeviceApiObject, LogicValues } from "../api-types";

import { DeviceModel } from "./DeviceModel";

export class ApiObjectDeviceModel implements DeviceModel {
  private readonly _data$: BehaviorSubject<DeviceApiObject>;
  private readonly _exists$ = new BehaviorSubject(true);
  private _awaitNextUpdate: Promise<void> | null = null;
  private _awaitNextUpdateResolve: (() => void) | null = null;

  constructor(
    data: DeviceApiObject,
    private readonly _api: StationeersApi
  ) {
    // TODO: Keep track of who is observing us, and trigger DevicesSource to delete us if we have no observers left.
    this._data$ = new BehaviorSubject(data);
  }

  get _observed() {
    return this._data$.observed;
  }

  get exists(): boolean {
    return this._exists$.value;
  }

  get exists$(): Observable<boolean> {
    return this._exists$;
  }

  get referenceId(): string {
    return this._data$.value.referenceId;
  }

  get displayName(): string {
    return this._data$.value.displayName;
  }

  private _displayName$: Observable<string> | null = null;
  get displayName$(): Observable<string> {
    if (!this._displayName$) {
      this._displayName$ = this._data$.pipe(
        map((data) => data.displayName),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._displayName$;
  }

  get logicValues(): LogicValues {
    return this._data$.value.logicValues;
  }

  private _logicValues$: Observable<LogicValues> | null = null;
  get logicValues$(): Observable<LogicValues> {
    if (!this._logicValues$) {
      this._logicValues$ = this._data$.pipe(
        map((data) => data.logicValues),
        distinctUntilChanged(isEqual),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._logicValues$;
  }

  // FIXME: We should support deep observation in the formula
  private _publicData$: Observable<DeviceApiObject> | null = null;
  get data$(): Observable<DeviceApiObject> {
    if (!this._publicData$) {
      this._publicData$ = this._data$.pipe(
        distinctUntilChanged(isEqual),
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }

    return this._publicData$;
  }

  async writeLogicValue(key: string, value: number): Promise<void> {
    if (!this.exists) {
      return Promise.reject(new Error("Device Not Found"));
    }

    await this._api.setLogicValue(this.referenceId, key, value);
    // Optimistically set the value
    this._update({
      ...this._data$.value,
      logicValues: {
        ...this._data$.value.logicValues,
        [key]: value,
      },
    });
  }

  awaitNextUpdate() {
    if (!this._awaitNextUpdate) {
      this._awaitNextUpdate = new Promise((resolve) => {
        this._awaitNextUpdateResolve = resolve;
      });
    }

    return this._awaitNextUpdate;
  }

  _update(data: DeviceApiObject) {
    if (this._awaitNextUpdate) {
      this._awaitNextUpdateResolve!();
      this._awaitNextUpdate = null;
      this._awaitNextUpdateResolve = null;
    }

    if (!this.exists) {
      return;
    }

    this._data$.next(cloneDeepFreeze(data));
  }

  _delete() {
    if (!this.exists) {
      return;
    }

    this._exists$.next(false);
    this._data$.error(new Error("Device Not Found"));
  }
}
