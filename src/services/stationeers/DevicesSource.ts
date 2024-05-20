import { inject, injectable, provides, singleton } from "microinject";
import {
  BehaviorSubject,
  Observable,
  Subject,
  distinctUntilChanged,
  map,
  shareReplay,
  tap,
} from "rxjs";

import { difference, isEqual, sortBy } from "lodash";
import { startTransition } from "react";

import { distinctUntilShallowArrayChanged } from "@/observables";

import { Initializable } from "../Initializable";
import { PollingScheduler } from "../polling";

import { DeviceApiObject, LogicValues } from "./api-types";
import { StationeersApi } from "./StationeersApi";

@injectable()
@singleton()
@provides(Initializable)
export class DevicesSource implements Initializable {
  private readonly _deviceModels = new Map<string, DeviceModel>();
  private readonly _devicesSubject$ = new Subject<readonly DeviceModel[]>();

  constructor(
    @inject(PollingScheduler)
    private readonly _pollingScheduler: PollingScheduler,
    @inject(StationeersApi) private readonly _api: StationeersApi
  ) {}

  onInitialize(): void {
    this._pollingScheduler.addTask(() => this._updateDevices());
  }

  private readonly _devices$ = this._devicesSubject$.pipe(
    distinctUntilShallowArrayChanged(),
    shareReplay(1),
    tap((devices) => console.log("Devices updated", devices))
  );
  get devices$(): Observable<readonly DeviceModel[]> {
    return this._devices$;
  }

  private async _updateDevices() {
    const devices = await this._api.getDevices();

    const existingDeviceIds = Array.from(this._deviceModels.keys());
    const foundIds = devices.map((t) => t.referenceId);
    const referenceIdsToRemove = difference(existingDeviceIds, foundIds);

    referenceIdsToRemove.forEach((id) => {
      const token = this._deviceModels.get(id);
      if (token) {
        this._deviceModels.delete(id);
      }
    });

    const tokenModels = sortBy(
      devices.map((device) => this._getOrUpdateDeviceModel(device)),
      "referenceId"
    );

    startTransition(() => {
      this._devicesSubject$.next(tokenModels);
    });
  }

  private _getOrUpdateDeviceModel(device: DeviceApiObject): DeviceModel {
    let model: DeviceModel;
    if (!this._deviceModels.has(device.referenceId)) {
      model = new DeviceModel(device);
      this._deviceModels.set(device.referenceId, model);
    } else {
      model = this._deviceModels.get(device.referenceId)!;
      model._update(device);
    }

    return model;
  }
}

export class DeviceModel {
  private readonly _data: BehaviorSubject<DeviceApiObject>;
  constructor(data: DeviceApiObject) {
    this._data = new BehaviorSubject(data);
  }

  get referenceId(): string {
    return this._data.value.referenceId;
  }

  get name(): string {
    if (this._data.value.customName === "") {
      return this._data.value.prefabName;
    }

    return this._data.value.customName;
  }

  private _name$: Observable<string> | null = null;
  get name$(): Observable<string> {
    if (!this._name$) {
      this._name$ = this._data.pipe(
        map(() => this.name),
        distinctUntilChanged(),
        shareReplay(1)
      );
    }

    return this._name$;
  }

  get logicValues(): LogicValues {
    return this._data.value.logicValues;
  }

  private _logicValues$: Observable<LogicValues> | null = null;
  get logicValues$(): Observable<LogicValues> {
    if (!this._logicValues$) {
      this._logicValues$ = this._data.pipe(
        map(() => this.logicValues),
        distinctUntilChanged(isEqual),
        shareReplay(1)
      );
    }

    return this._logicValues$;
  }

  // FIXME: We should support deep observation in the formula
  get data$(): Observable<DeviceApiObject> {
    return this._data;
  }

  _update(data: DeviceApiObject) {
    this._data.next(data);
  }
}
