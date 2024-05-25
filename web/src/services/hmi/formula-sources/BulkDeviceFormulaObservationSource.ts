import { inject, injectable, provides, singleton } from "microinject";
import { Observable, switchMap, combineLatest } from "rxjs";

import { PollingScheduler } from "@/services/polling";
import { HmiContext } from "@/services/hmi/HmiContext";
import { FormulaObservationSource } from "@/services/formula/FormulaObservationSource";
import { StationeersApi } from "@/services/stationeers/StationeersApi";
import { HmiConnectedDevicesSource } from "../HmiConnectedDeviceSource";
import { DeviceApiObject } from "@/services/stationeers/api-types";

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class BulkDeviceFormulaObservationSource
  implements FormulaObservationSource
{
  constructor(
    @inject(StationeersApi) private readonly _api: StationeersApi,
    @inject(PollingScheduler)
    private readonly _pollingScheduler: PollingScheduler,
    @inject(HmiContext) private readonly _hmiContext: HmiContext,
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

    return combineLatest([this._hmiContext.dataNetworkId$, prefabName]).pipe(
      switchMap(([dataNetworkId, prefabName]) => {
        return new Observable<DeviceApiObject[]>((subscriber) => {
          const subscription = this._pollingScheduler.addTask(async () => {
            if (dataNetworkId == null) {
              subscriber.next([]);
              return;
            }

            try {
              const devices = await this._api.queryDevices({
                prefabNames: [prefabName],
                dataNetworkIds: [dataNetworkId],
                matchIntersection: true,
              });

              subscriber.next(devices);
            } catch (e) {
              subscriber.error(e);
            }
          });

          return () => {
            subscription();
          };
        });
      }),
      switchMap((devices) => {
        return combineLatest(
          devices.map((device) =>
            this._connectedDevicesSource.getDeviceById(device.referenceId)
          )
        );
      })
    );
  }
}
