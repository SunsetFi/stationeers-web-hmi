import { difference, merge } from "lodash";
import { Observable, map } from "rxjs";
import { startTransition } from "react";

import { PollingScheduler } from "@/services/polling";

import { StationeersApi } from "../StationeersApi";
import { DeviceApiObject, DeviceQueryPayload } from "../api-types";

import { ApiObjectDeviceModel } from "./ApiObjectDeviceModel";
import { QueryingDeviceModel } from "./QueryingDeviceModel";

import { DeviceModel } from "./DeviceModel";
import { NullDeviceModel } from "./NullDeviceModel";

export class QueryingDevicesSource {
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

  constructor(
    pollingScheduler: PollingScheduler,
    private readonly _api: StationeersApi,
    private readonly _globalQuery: Observable<DeviceQueryPayload>
  ) {
    pollingScheduler.addTask(() => this._updateDevices());
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

      model = new QueryingDeviceModel(referenceQuery$, this._api, (data) =>
        this._getOrUpdateDeviceModel(data)
      );

      this._referenceIdDeviceModels.set(referenceId, model);
    }

    await model._awaitInitialResolve();

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

  private async _updateDevices() {
    const existingDeviceIds = Array.from(this._apiObjectDeviceModels.keys());

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
      model = new ApiObjectDeviceModel(device);
      this._apiObjectDeviceModels.set(device.referenceId, model);
    } else {
      model = this._apiObjectDeviceModels.get(device.referenceId)!;
      model._update(device);
    }

    return model;
  }
}
