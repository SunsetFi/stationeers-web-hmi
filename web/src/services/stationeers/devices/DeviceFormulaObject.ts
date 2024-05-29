import { Observable, combineLatest, map } from "rxjs";

import { DeviceApiObject } from "../api-types";

import { DeviceModel } from "./DeviceModel";

const ModelSymbol = Symbol("DeviceModel");

export type DeviceFormulaObject = Omit<
  DeviceModel,
  "logicValues" | "writeLogicValue" | "awaitNextUpdate"
> &
  Omit<
    DeviceApiObject,
    "logicValues" | "logicSlotValues" | "slotReferenceIds"
  > & {
    [ModelSymbol]: DeviceModel;
  };

// While MathJS has had a TODO to add support for reading class properties since forever, they have still not gotten to it.
// On top of that, we want to live react to these properties changing.
// This exposes DeviceModel but adds some of the more static properties to it to avoid constant updates.
export function modelToDeviceFormulaObject(
  device: DeviceModel
): Observable<DeviceFormulaObject> {
  return combineLatest([device.data$, device.exists$]).pipe(
    map(
      ([data, exists]) =>
        ({
          exists,

          // data we can use directly in the formula through property access
          referenceId: data.referenceId,
          prefabHash: data.prefabHash,
          prefabName: data.prefabName,
          health: data.health,
          customName: data.customName,
          accessState: data.accessState,
          displayName: data.displayName,
          dataNetworkId: data.dataNetworkId,

          // carry-through observables for the observation based functions to use.
          exists$: device.exists$,
          displayName$: device.displayName$,
          logicValues$: device.logicValues$,
          data$: device.data$,

          [ModelSymbol]: device,
        }) satisfies DeviceFormulaObject
    )
  );
}

export function deviceFormulaObjectToModel(
  device: DeviceFormulaObject
): DeviceModel {
  return device[ModelSymbol];
}
