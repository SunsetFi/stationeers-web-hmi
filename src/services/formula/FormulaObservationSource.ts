import { Identifier } from "microinject";
import { Observable } from "rxjs";

export const FormulaObservationSource: Identifier<FormulaObservationSource> =
  "FormulaObservationSource";
export interface FormulaObservationSource {
  readonly type: "function" | "symbol";
  readonly name: string;
  resolve(args: Observable<any>[]): Observable<any>;
}
