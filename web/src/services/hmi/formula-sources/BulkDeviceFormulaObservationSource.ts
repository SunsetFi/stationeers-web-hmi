import { inject, injectable, provides, singleton } from "microinject";
import { Observable, switchMap, map } from "rxjs";

import { observeAll } from "@/observables";

import { FormulaObservationSource } from "@/services/formula/FormulaObservationSource";
import { modelToDeviceFormulaObject } from "@/services/stationeers/devices/DeviceFormulaObject";

import { HmiConnectedDevicesSource } from "../HmiConnectedDeviceSource";

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class BulkDeviceFormulaObservationSource
  implements FormulaObservationSource
{
  constructor(
    @inject(HmiConnectedDevicesSource)
    private readonly _connectedDevicesSource: HmiConnectedDevicesSource
  ) {}

  readonly type = "function";
  readonly name = "devicesByPrefab";

  resolve(args: Observable<any>[]): Observable<any> {
    const [prefabName] = args;

    if (!prefabName) {
      throw new Error("Prefab Name argument is required.");
    }

    return prefabName.pipe(
      switchMap((prefabName) =>
        this._connectedDevicesSource.getDevicesByPrefabName(prefabName)
      ),
      map((devices) =>
        devices.map((device) => modelToDeviceFormulaObject(device))
      ),
      observeAll()
    );
  }
}
