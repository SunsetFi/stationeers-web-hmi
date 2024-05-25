import { Observable } from "rxjs";

import { DeviceApiObject, LogicValues } from "../api-types";

export interface DeviceModel {
  readonly exists: boolean;
  readonly referenceId: string;
  readonly displayName: string;
  readonly displayName$: Observable<string>;
  readonly logicValues: LogicValues;
  // TODO: Support observation of properties in FormulaCompiler.
  // This is here as a hack for DeviceFormulaObservationSource.
  readonly data$: Observable<DeviceApiObject>;
}
