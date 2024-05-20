import { inject, injectable, provides, singleton } from "microinject";
import {
  Observable,
  combineLatest,
  map,
  mergeMap,
  shareReplay,
  of as observableOf,
} from "rxjs";

import { observeAll } from "@/observables";

import { FormulaObservationSource } from "../formula/FormulaObservationSource";

import { DeviceModel, DevicesSource } from "./DevicesSource";

const numerics = /^[0-9]+$/;

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class DeviceFormulaObservationSource
  implements FormulaObservationSource
{
  private _devicesByName: Observable<Record<string, DeviceModel>>;
  constructor(
    @inject(DevicesSource) private readonly _devicesSource: DevicesSource
  ) {
    this._devicesByName = this._devicesSource.devices$.pipe(
      map((devices) =>
        devices.map((device) =>
          device.displayName$.pipe(map((name) => [name, device]))
        )
      ),
      observeAll(),
      map((entries) => Object.fromEntries(entries)),
      shareReplay(1)
    );
  }

  readonly type = "function";
  readonly name = "device";

  resolve(args: Observable<any>[]): Observable<any> {
    const [deviceId] = args;
    return combineLatest([deviceId, this._devicesByName]).pipe(
      map(([deviceId, devices]) => {
        if (
          typeof deviceId === "number" ||
          (typeof deviceId === "string" && numerics.test(deviceId))
        ) {
          // Reference IDs are longs, which cannot be represented safely in JS.
          // Because of this, they are transmitted as strings, and we deal with them as such.
          const referenceId = deviceId.toString();
          return (
            Object.values(devices).find((d) => d.referenceId === referenceId) ??
            null
          );
        }

        return devices[deviceId] ?? null;
      }),
      // FIXME: We should do deep observations, but this works for now.
      mergeMap((device) => (device ? device.data$ : observableOf(null)))
    );
  }
}
