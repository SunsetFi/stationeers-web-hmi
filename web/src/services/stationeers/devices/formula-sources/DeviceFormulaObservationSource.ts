import { inject, injectable, provides, singleton } from "microinject";
import { Observable, switchMap, of as observableOf } from "rxjs";

import { FormulaObservationSource } from "../../../formula/FormulaObservationSource";

import { isReferenceId } from "../../api-types";

import { DevicesSource } from "../DevicesSource";
import { NullDeviceModel } from "../NullDeviceModel";

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class DeviceFormulaObservationSource
  implements FormulaObservationSource
{
  constructor(
    @inject(DevicesSource) private readonly _devicesSource: DevicesSource
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
          return observableOf(new NullDeviceModel());
        }
      }),
      switchMap((device) => device.data$)
    );
  }
}
