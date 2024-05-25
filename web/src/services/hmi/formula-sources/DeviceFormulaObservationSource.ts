import { inject, injectable, provides, singleton } from "microinject";
import { Observable, switchMap } from "rxjs";

import { FormulaObservationSource } from "@/services/formula/FormulaObservationSource";
import { isReferenceId } from "@/services/stationeers/api-types";
import { modelToDeviceFormulaObject } from "@/services/stationeers/devices/DeviceFormulaObject";

import { HmiConnectedDevicesSource } from "../HmiConnectedDeviceSource";

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class DeviceFormulaObservationSource
  implements FormulaObservationSource
{
  constructor(
    @inject(HmiConnectedDevicesSource)
    private readonly _devicesSource: HmiConnectedDevicesSource
  ) {}

  readonly type = "function";
  readonly name = "device";

  resolve(args: Observable<any>[]): Observable<any> {
    const [deviceId] = args;
    if (!deviceId) {
      throw new Error("Device ID argument is required.");
    }

    return deviceId.pipe(
      switchMap((deviceId) => {
        if (isReferenceId(deviceId) || typeof deviceId === "number") {
          return this._devicesSource.getDeviceById(String(deviceId));
        } else if (typeof deviceId === "string") {
          return this._devicesSource.getDeviceByDisplayName(deviceId);
        } else {
          throw new Error("Invalid device ID.");
        }
      }),
      switchMap((device) => modelToDeviceFormulaObject(device))
    );
  }
}
