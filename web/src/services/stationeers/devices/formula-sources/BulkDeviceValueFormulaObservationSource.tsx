import { inject, injectable, provides, singleton } from "microinject";
import {
  Observable,
  switchMap,
  of as observableOf,
  combineLatest,
  map,
  distinctUntilChanged,
} from "rxjs";

import { FormulaObservationSource } from "../../../formula/FormulaObservationSource";

import { isReferenceId } from "../../api-types";

import { DevicesSource } from "../DevicesSource";
import { NullDeviceModel } from "../NullDeviceModel";
import { StationeersApi } from "../../StationeersApi";
import { PollingScheduler } from "@/services/polling";
import { HmiContext } from "@/services/hmi/HmiContext";

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class BulkDevicePrefabLogicValueFormulaObservationSource
  implements FormulaObservationSource
{
  constructor(
    @inject(StationeersApi) private readonly _api: StationeersApi,
    @inject(PollingScheduler)
    private readonly _pollingScheduler: PollingScheduler,
    @inject(HmiContext) private readonly _hmiContext: HmiContext
  ) {}

  readonly type = "function";
  readonly name = "bulkDevicePrefabLogicValue";

  resolve(args: Observable<any>[]): Observable<any> {
    const [prefabName, logicValue] = args;

    if (!prefabName) {
      throw new Error("Prefab Name argument is required.");
    }

    if (!logicValue) {
      throw new Error("Logic value argument is required.");
    }

    return combineLatest([
      this._hmiContext.cableNetworkId$,
      prefabName,
      logicValue,
    ]).pipe(
      switchMap(([cableNetworkIds, prefabName, logicValue]) => {
        return new Observable<any>((subscriber) => {
          const subscription = this._pollingScheduler.addTask(async () => {
            try {
              const devices = await this._api.queryDevices({
                prefabNames: [prefabName],
                cableNetworkIds: cableNetworkIds,
                matchIntersection: true,
              });

              const values = devices
                .map((x) => x.logicValues[String(logicValue)] ?? Number.NaN)
                .filter((x) => !Number.isNaN(x));

              subscriber.next(values);
            } catch (e) {
              subscriber.error(e);
            }
          });

          return () => {
            subscription();
          };
        });
      })
    );
  }
}
