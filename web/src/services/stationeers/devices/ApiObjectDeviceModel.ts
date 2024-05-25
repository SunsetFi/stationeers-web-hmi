import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  shareReplay,
} from "rxjs";
import { isEqual } from "lodash";

import { cloneDeepFreeze } from "@/utils";

import { DeviceApiObject, LogicValues } from "../api-types";

import { DeviceModel } from "./DeviceModel";

export class ApiObjectDeviceModel implements DeviceModel {
  private readonly _data$: BehaviorSubject<DeviceApiObject>;
  private readonly _exists$ = new BehaviorSubject(true);

  constructor(data: DeviceApiObject) {
    // TODO: Keep track of who is observing us, and trigger DevicesSource to delete us if we have no observers left.
    this._data$ = new BehaviorSubject(data);
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
        shareReplay(1)
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
        shareReplay(1)
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
        shareReplay(1)
      );
    }

    return this._publicData$;
  }

  _update(data: DeviceApiObject) {
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
