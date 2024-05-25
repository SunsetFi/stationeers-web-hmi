import { Observable, combineLatest, map } from "rxjs";
import { omit } from "lodash";

import { DeviceApiObject } from "../api-types";

import { DeviceModel } from "./DeviceModel";

export type DeviceFormulaObject = Omit<DeviceModel, "logicValues"> &
  Omit<DeviceApiObject, "logicValues" | "logicSlotValues" | "slotReferenceIds">;

// While MathJS has had a TODO to add support for reading class properties since forever, they have still not gotten to it.
// On top of that, we want to live react to these properties changing.
// This exposes DeviceModel but adds some of the more static properties to it to avoid constant updates.
export function modelToDeviceFormulaObject(
  device: DeviceModel
): Observable<DeviceFormulaObject> {
  return combineLatest([
    device.data$.pipe(
      map((data) =>
        omit(data, ["logicValues", "logicSlotValues", "slotReferenceIds"])
      )
    ),
    device.exists$,
  ]).pipe(
    map(
      ([data, exists]) =>
        ({
          exists,
          exists$: device.exists$,
          displayName$: device.displayName$,
          logicValues$: device.logicValues$,
          data$: device.data$,
          referenceId: data.referenceId,
          prefabHash: data.prefabHash,
          prefabName: data.prefabName,
          health: data.health,
          customName: data.customName,
          accessState: data.accessState,
          displayName: data.displayName,
          dataNetworkId: data.dataNetworkId,
        }) satisfies DeviceFormulaObject
    )
  );
}
