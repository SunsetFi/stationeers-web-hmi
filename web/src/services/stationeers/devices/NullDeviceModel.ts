import { Observable, of as observableOf } from "rxjs";

import { DeviceApiObject, LogicValues, ReferenceId } from "../api-types";

import { DeviceModel } from "./DeviceModel";

export class NullDeviceModel implements DeviceModel {
  get exists(): boolean {
    return false;
  }

  get referenceId(): string {
    return "0";
  }

  get displayName(): string {
    return "Device Not Found";
  }

  private readonly _displayName$ = observableOf("");
  get displayName$(): Observable<string> {
    return this._displayName$;
  }

  get logicValues(): LogicValues {
    return {};
  }

  private readonly _data$ = observableOf(
    Object.freeze({
      referenceId: "0" as ReferenceId,
      prefabHash: 0,
      prefabName: "",
      health: 0,
      customName: "",
      accessState: 0,
      displayName: "Device Not Found",
      logicValues: Object.freeze({}),
      logicSlotValues: Object.freeze({}),
      slotReferenceIds: Object.freeze({}),
      dataNetworkId: null,
    } satisfies DeviceApiObject)
  );
  get data$(): Observable<DeviceApiObject> {
    return this._data$;
  }
}
