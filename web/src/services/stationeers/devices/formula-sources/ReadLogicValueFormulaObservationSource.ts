import { injectable, provides, singleton } from "microinject";
import { Observable, switchMap, combineLatest, map } from "rxjs";

import { FormulaObservationSource } from "@/services/formula/FormulaObservationSource";

import { DeviceModel } from "../DeviceModel";
import { DeviceFormulaObject } from "../DeviceFormulaObject";

@injectable()
@singleton()
@provides(FormulaObservationSource)
export class ReadLogicValueFormulaObservationSource
  implements FormulaObservationSource
{
  constructor() {}

  readonly type = "function";
  readonly name = "readLogicValue";

  resolve(args: Observable<any>[]): Observable<any> {
    const [devices, logicValue] = args as [
      Observable<
        | DeviceModel
        | DeviceFormulaObject
        | DeviceModel[]
        | DeviceFormulaObject[]
      >,
      Observable<string>,
    ];

    return combineLatest([devices, logicValue]).pipe(
      switchMap(([devices, logicValue]) => {
        const isArray = Array.isArray(devices);
        const asArray = isArray ? devices : [devices];
        return combineLatest(asArray.map((device) => device.logicValues$)).pipe(
          map((valuesArray) =>
            valuesArray.map((values) => values[logicValue] ?? Number.NaN)
          ),
          map((values) => (isArray ? values : values[0]))
        );
      })
    );
  }
}
