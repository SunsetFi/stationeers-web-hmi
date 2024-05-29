import { inject, injectable, provides, singleton } from "microinject";
import { firstValueFrom, combineLatest, of as observableOf } from "rxjs";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";
import {
  DeviceFormulaObject,
  deviceFormulaObjectToModel,
} from "@/services/stationeers/devices/DeviceFormulaObject";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

import { HmiActionBase } from "../types";

import { HmiActionDef } from "./HmiActionDef";

export interface WriteLogicValueHmiAction extends HmiActionBase {
  action: "writeLogicValue";
  device: string;
  logicValue: string;
  value: string | number;
}

@injectable()
@singleton()
@provides(HmiActionDef)
export class WriteLogicValueHmiActionDef
  implements HmiActionDef<WriteLogicValueHmiAction>
{
  constructor(
    @inject(FormulaCompiler) private readonly _formulaCompiler: FormulaCompiler
  ) {}

  get type() {
    return "writeLogicValue";
  }

  async execute(
    context: HmiScreenContext,
    { device, logicValue, value }: WriteLogicValueHmiAction
  ): Promise<void> {
    const device$ = this._formulaCompiler.compileFormula(device, context);
    const logicValue$ = this._formulaCompiler.compileTemplateString(
      logicValue,
      context
    );
    const value$ =
      typeof value === "number"
        ? observableOf(value)
        : this._formulaCompiler.compileFormula(value, context);

    const [resolvedDevice, resolvedLogicValue, resolvedValue] =
      await firstValueFrom(combineLatest([device$, logicValue$, value$]));

    // TODO: Check devices are the right species
    const resolvedDeviceArray: DeviceFormulaObject[] = Array.isArray(
      resolvedDevice
    )
      ? resolvedDevice
      : [resolvedDevice];

    if (Number.isNaN(resolvedValue)) {
      throw new Error("value parameter must be a number");
    }

    const deviceModels = await Promise.all(
      resolvedDeviceArray.map((device) => deviceFormulaObjectToModel(device))
    );

    await Promise.all(
      deviceModels.map((device) => {
        device.writeLogicValue(resolvedLogicValue, resolvedValue);
      })
    );
  }
}
