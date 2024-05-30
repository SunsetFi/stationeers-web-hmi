import { inject, injectable, provides, singleton } from "microinject";
import { firstValueFrom, of as observableOf } from "rxjs";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

import { HmiActionBase } from "../types";

import { HmiActionDef } from "./HmiActionDef";

export interface SetVariableHmiAction extends HmiActionBase {
  action: "setVariable";
  variable: string;
  value: string | number | boolean | null;
}

@injectable()
@singleton()
@provides(HmiActionDef)
export class SetVariableHmiActionDef
  implements HmiActionDef<SetVariableHmiAction>
{
  constructor(
    @inject(FormulaCompiler) private readonly _formulaCompiler: FormulaCompiler
  ) {}

  get type() {
    return "setVariable";
  }

  async execute(
    context: HmiScreenContext,
    { variable, value }: SetVariableHmiAction
  ): Promise<void> {
    const value$ =
      typeof value === "string"
        ? this._formulaCompiler.compileTemplateString(value, context)
        : observableOf(value);

    const resolvedValue = await firstValueFrom<any>(value$);

    context.setVariable(variable, resolvedValue);
  }
}
