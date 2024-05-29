import { difference, merge, sortBy } from "lodash";
import { Observable, Subject, map, shareReplay } from "rxjs";
import { startTransition } from "react";

import { arrayShallowEquals } from "@/utils";

import { PollingScheduler } from "@/services/polling";

import { StationeersApi } from "../StationeersApi";
import { DeviceApiObject, DeviceQueryPayload } from "../api-types";

import { ApiObjectDeviceModel } from "./ApiObjectDeviceModel";
import { QueryingDeviceModel } from "./QueryingDeviceModel";

import { DeviceModel } from "./DeviceModel";
import { DevicesSource } from "./DevicesSource";
import { NullDeviceModel } from "./NullDeviceModel";

export class QueryingDevicesSource implements DevicesSource {
  private readonly _apiObjectDeviceModels = new Map<
    string,
    ApiObjectDeviceModel
  >();
  private readonly _referenceIdDeviceModels = new Map<
    string,
    QueryingDeviceModel
  >();
  private readonly _displayNameDeviceModels = new Map<
    string,
    QueryingDeviceModel
  >();
  private readonly _prefabNameDeviceObservables = new Map<
    string,
    DevicePrefabObservable
  >();

  constructor(
    private readonly _pollingScheduler: PollingScheduler,
    private readonly _api: StationeersApi,
    private readonly _globalQuery: Observable<DeviceQueryPayload>
  ) {
    _pollingScheduler.addTask(() => this._updateDevices(), "Update Devices");
  }

  async getDeviceById(referenceId: string): Promise<DeviceModel> {
    let model = this._referenceIdDeviceModels.get(referenceId);
    if (!model) {
      const referenceQuery$ = this._globalQuery.pipe(
        map((query) =>
          merge({}, query, {
            referenceIds: [referenceId],
            matchIntersection: true,
          } satisfies DeviceQueryPayload)
        )
      );

      const initialModel =
        this._apiObjectDeviceModels.get(referenceId) ?? new NullDeviceModel();

      model = new QueryingDeviceModel(
        referenceQuery$,
        this._api,
        (data) => this._getOrUpdateDeviceModel(data),
        initialModel
      );

      this._referenceIdDeviceModels.set(referenceId, model);
    }

    console.log("Awaiting initial resolve for", referenceId);
    await model._awaitInitialResolve();
    console.log("Initial resolve complete for", referenceId, model);

    return model;
  }

  async getDeviceByDisplayName(displayName: string): Promise<DeviceModel> {
    let model = this._displayNameDeviceModels.get(displayName);
    if (!model) {
      const nameQuery$ = this._globalQuery.pipe(
        map((query) =>
          merge({}, query, {
            displayNames: [displayName],
            matchIntersection: true,
          } satisfies DeviceQueryPayload)
        )
      );

      model = new QueryingDeviceModel(nameQuery$, this._api, (data) =>
        this._getOrUpdateDeviceModel(data)
      );

      this._displayNameDeviceModels.set(displayName, model);
    }

    await model._awaitInitialResolve();

    return model;
  }

  getDevicesByPrefabName(prefabName: string): Observable<DeviceModel[]> {
    let observable = this._prefabNameDeviceObservables.get(prefabName);
    if (!observable) {
      observable = new DevicePrefabObservable(
        prefabName,
        this._api,
        this._globalQuery,
        this._pollingScheduler,
        (data) => this._getOrUpdateDeviceModel(data)
      );

      this._prefabNameDeviceObservables.set(prefabName, observable);
    }

    return observable;
  }

  private async _updateDevices() {
    // Only query devices that are being observed.
    // Note that this could let static properties go stale.
    const observedDeviceIds = Array.from(this._apiObjectDeviceModels.values())
      .filter((x) => x._observed)
      .map((x) => x.referenceId);

    if (observedDeviceIds.length === 0) {
      return;
    }

    const devices = await this._api.queryDevices({
      referenceIds: observedDeviceIds,
    });

    const foundIds = devices.map((t) => t.referenceId);
    const referenceIdsToRemove = difference(observedDeviceIds, foundIds);

    // Perform observable changing actions in a transaction to avoid flooding react with rerenders.
    startTransition(() => {
      referenceIdsToRemove.forEach((id) => {
        const token = this._apiObjectDeviceModels.get(id);
        if (token) {
          token._delete();
          this._apiObjectDeviceModels.delete(id);
        }
      });

      devices.forEach((device) => this._getOrUpdateDeviceModel(device));
    });
  }

  private _getOrUpdateDeviceModel(device: DeviceApiObject): DeviceModel {
    let model: ApiObjectDeviceModel;
    if (!this._apiObjectDeviceModels.has(device.referenceId)) {
      model = new ApiObjectDeviceModel(device, this._api);
      this._apiObjectDeviceModels.set(device.referenceId, model);
    } else {
      model = this._apiObjectDeviceModels.get(device.referenceId)!;
      model._update(device);
    }

    return model;
  }
}

class DevicePrefabObservable extends Observable<DeviceModel[]> {
  private _previousModels: DeviceModel[] | null = null;
  private _subject$ = new Subject<DeviceModel[]>();
  private _subscribable$ = this._subject$.pipe(shareReplay(1));

  constructor(
    private readonly _prefabName: string,
    private readonly _api: StationeersApi,
    private readonly _globalQuery: Observable<DeviceQueryPayload>,
    private readonly _pollingScheduler: PollingScheduler,
    private readonly _resolveDeviceModel: (data: DeviceApiObject) => DeviceModel
  ) {
    super((subscriber) => {
      return this._subscribable$.subscribe(subscriber);
    });

    let query: DeviceQueryPayload | null = null;
    this._globalQuery.subscribe((q) => (query = q));

    this._pollingScheduler.addTask(async () => {
      let devices: DeviceApiObject[];
      try {
        devices = await this._api.queryDevices(
          merge({}, query, {
            prefabNames: [this._prefabName],
            matchIntersection: true,
          })
        );
      } catch (e) {
        this._subject$.error(e);
        return;
      }

      devices = sortBy(devices, (d) => d.referenceId);
      let models = devices.map((d) => this._resolveDeviceModel(d));

      // We could use a BehaviorSubject here, but we want to avoid emitting an empty array at the start.
      if (
        !this._previousModels ||
        !arrayShallowEquals(models, this._previousModels)
      ) {
        this._previousModels = models;
        this._subject$.next(models);
      }
    }, `ByPrefab ${this._prefabName}`);
  }
}
