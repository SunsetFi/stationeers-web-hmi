import { inject, injectable, provides, singleton } from "microinject";
import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  shareReplay,
  Subscription,
  switchMap,
} from "rxjs";

import { difference, isEqual } from "lodash";
import { startTransition } from "react";

import { cloneDeepFreeze } from "@/utils";

import { Initializable } from "../../Initializable";
import { PollingScheduler } from "../../polling";

import { DeviceApiObject, LogicValues } from "../api-types";
import { StationeersApi } from "../StationeersApi";

import { DeviceModel } from "./DeviceModel";
import { NullDeviceModel } from "./NullDeviceModel";
import { HmiContext } from "@/services/hmi/HmiContext";

@injectable()
@singleton()
@provides(Initializable)
export class DevicesSource implements Initializable {
  private readonly _dataDeviceModels = new Map<string, DataDeviceModel>();
  private readonly _displayNameDeviceModels = new Map<
    string,
    DisplayNameDeviceModel
  >();

  constructor(
    @inject(PollingScheduler)
    private readonly _pollingScheduler: PollingScheduler,
    @inject(StationeersApi) private readonly _api: StationeersApi,
    @inject(HmiContext) private readonly _hmiContext: HmiContext
  ) {}

  onInitialize(): void {
    this._pollingScheduler.addTask(() => this._updateDevices());
  }

  async getDeviceById(referenceId: string): Promise<DeviceModel> {
    if (!this._dataDeviceModels.has(referenceId)) {
      const data = await this._api.getDevice(referenceId);
      if (!data) {
        return new NullDeviceModel();
      }

      this._getOrUpdateDeviceModel(data);
    }

    return this._dataDeviceModels.get(referenceId)!;
  }

  async getDeviceByDisplayName(displayName: string): Promise<DeviceModel> {
    let model = this._displayNameDeviceModels.get(displayName);
    if (!model) {
      model = new DisplayNameDeviceModel(
        displayName,
        new NullDeviceModel(),
        this._api,
        this._hmiContext,
        (data) => this._getOrUpdateDeviceModel(data)
      );

      this._displayNameDeviceModels.set(displayName, model);
    }

    return model;
  }

  private async _updateDevices() {
    const existingDeviceIds = Array.from(this._dataDeviceModels.keys());

    if (existingDeviceIds.length === 0) {
      return;
    }

    const devices = await this._api.queryDevices({
      referenceIds: existingDeviceIds,
    });

    const foundIds = devices.map((t) => t.referenceId);
    const referenceIdsToRemove = difference(existingDeviceIds, foundIds);

    // Perform observable changing actions in a transaction to avoid flooding react with rerenders.
    startTransition(() => {
      referenceIdsToRemove.forEach((id) => {
        const token = this._dataDeviceModels.get(id);
        if (token) {
          token._delete();
          this._dataDeviceModels.delete(id);
        }
      });

      devices.forEach((device) => this._getOrUpdateDeviceModel(device));
    });
  }

  private _getOrUpdateDeviceModel(device: DeviceApiObject): DataDeviceModel {
    let model: DataDeviceModel;
    if (!this._dataDeviceModels.has(device.referenceId)) {
      model = new DataDeviceModel(device);
      this._dataDeviceModels.set(device.referenceId, model);
    } else {
      model = this._dataDeviceModels.get(device.referenceId)!;
      model._update(device);
    }

    return model;
  }
}

class DataDeviceModel implements DeviceModel {
  private readonly _data$: BehaviorSubject<DeviceApiObject>;
  private _deleted = false;

  constructor(data: DeviceApiObject) {
    // TODO: Keep track of who is observing us, and trigger DevicesSource to delete us if we have no observers left.
    this._data$ = new BehaviorSubject(data);
  }

  get exists(): boolean {
    return !this._deleted;
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
        map(() => this.displayName),
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
        map(() => this.logicValues),
        distinctUntilChanged(isEqual),
        shareReplay(1)
      );
    }

    return this._logicValues$;
  }

  // FIXME: We should support deep observation in the formula
  get data$(): Observable<DeviceApiObject> {
    return this._data$;
  }

  _update(data: DeviceApiObject) {
    if (this._deleted) {
      return;
    }

    this._data$.next(cloneDeepFreeze(data));
  }

  _delete() {
    if (this._deleted) {
      return;
    }

    this._deleted = true;
    this._data$.error(new Error("Device Not Found"));
  }
}

/**
 * A device model that represents a device by its display name.
 * When the display name changes, the model will attempt to resolve a new device with the given name.
 */
class DisplayNameDeviceModel implements DeviceModel {
  // FIXME: This model is constantly monitoring the game but has no teardown.
  // We need to track subscriptions and tear down our tracking once everyone unsubscribes.

  // FIXME: This is kinda a mess since we added network id restrictions.  Clean it up.

  private readonly _resolved$: BehaviorSubject<DeviceModel>;
  private _resolvedNameChangeSubscription: Subscription | null = null;
  private _scheduledResolve: number | null = null;
  private _currentNetworkIds: readonly string[] = [];

  constructor(
    private readonly _displayName: string,
    initialModel: DeviceModel,
    private readonly _api: StationeersApi,
    private readonly _hmiContext: HmiContext,
    private readonly _getOrUpdateDeviceModel: (
      data: DeviceApiObject
    ) => DataDeviceModel
  ) {
    // FIXME: This is never unsubscribed to.
    this._hmiContext.cableNetworkId$.subscribe((networkIds) => {
      this._currentNetworkIds = networkIds;
      this._scheduleResolve();
    });

    this._resolved$ = new BehaviorSubject(initialModel);
    this._subscribeToResolved();
  }

  get exists(): boolean {
    return this._resolved$.value.exists;
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
    try {
      // TODO: If we were resolved to an item, we won't be needing it anymore.
      // However, since we registered it with DevicesSource, we are tracking it forever.
      // We need our items to delete themselves when they are no longer needed.
      const [item] = await this._api.queryDevices({
        displayNames: [this._displayName],
        cableNetworkIds: this._currentNetworkIds,
        matchIntersection: true,
      });

      if (!item) {
        this._resolvedNameChangeSubscription?.unsubscribe();
        this._resolvedNameChangeSubscription = null;
        this._resolved$.next(new NullDeviceModel());

        // We need to call this again though, in case we already had failed to resolve last loop.
        this._scheduleResolve();
        return;
      }

      this._resolved$.next(this._getOrUpdateDeviceModel(item));
      this._subscribeToResolved();
    } catch (e) {
      console.error("Failed to fetch device by name", e);
      this._resolved$.next(new NullDeviceModel());
    }
  }

  private _subscribeToResolved() {
    if (this._resolvedNameChangeSubscription) {
      this._resolvedNameChangeSubscription.unsubscribe();
    }

    this._resolvedNameChangeSubscription = this._resolved$
      .pipe(
        switchMap((value) => value.displayName$),
        distinctUntilChanged()
      )
      .subscribe((name) => {
        if (name != this._displayName) {
          // The device we were watching has changed name, so we no longer represent it.
          // Look for a new device to resolve.  We might not represent anything until a new one is found.
          this._scheduleResolve();
        }
      });
  }
}
