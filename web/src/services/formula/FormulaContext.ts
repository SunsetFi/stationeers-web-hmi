import * as math from "mathjs";
import { Observable } from "rxjs";

export interface FormulaContext {
  resolveObservation?(
    node: math.FunctionNode | math.SymbolNode,
    compile: (node: math.MathNode) => Observable<any>
  ): Observable<any> | null;
}

export const NullFormulaContext: FormulaContext = Object.freeze({});
