import { inject, injectable, singleton } from "microinject";
import { entries, mapValues } from "lodash";
import { firstValueFrom } from "rxjs";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { HmiScreenContext } from "../screens/HmiScreenContext";

import { HmiActionDef } from "./defs/HmiActionDef";

import { HmiAction } from "./types";

@injectable()
@singleton()
export class HmiActionExecutor {
  constructor(
    @inject(FormulaCompiler) private readonly _formulaCompiler: FormulaCompiler,
    @inject(HmiActionDef, { all: true }) private readonly _defs: HmiActionDef[]
  ) {}

  async executeAction(context: HmiScreenContext, action: HmiAction) {
    const def = this._defs.find((d) => d.type === action.type);
    if (!def) {
      throw new Error(`Unknown action type: ${action.type}`);
    }

    // Recompiling this every execution is a bit wasteful, but I can't think of anything better.
    const parameterPromises = mapValues(action.parameters, (arg) =>
      // If these dont get a value from the observable, this observable stays subscribed forever...
      // Shouldn't be too big of an issue?
      firstValueFrom(this._formulaCompiler.compileFormula(arg, context))
    );

    const parameters = await awaitValues(parameterPromises);

    await def.execute(context, parameters);
  }
}

async function awaitValues(
  obj: Record<string, Promise<any>>
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};
  await Promise.all(
    entries(obj).map(([key, promise]) =>
      promise.then((value) => (result[key] = value))
    )
  );
  return result;
}
