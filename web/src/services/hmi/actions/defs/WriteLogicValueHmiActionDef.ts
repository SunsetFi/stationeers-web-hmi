import { inject, injectable, provides, singleton } from "microinject";
import { firstValueFrom, combineLatest, of as observableOf } from "rxjs";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

import { HmiConnectedDevicesSource } from "../../HmiConnectedDeviceSource";

import { HmiActionBase } from "../types";

import { HmiActionDef } from "./HmiActionDef";
import { DeviceFormulaObject } from "@/services/stationeers/devices/DeviceFormulaObject";
import { DeviceModel } from "@/services/stationeers/devices/DeviceModel";

export interface WriteLogicValueHmiAction extends HmiActionBase {
  type: "writeLogicValue";
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
    @inject(FormulaCompiler) private readonly _formulaCompiler: FormulaCompiler,
    @inject(HmiConnectedDevicesSource)
    private readonly _connectedDevices: HmiConnectedDevicesSource
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
    const resolvedDeviceArray: (DeviceModel | DeviceFormulaObject)[] =
      Array.isArray(resolvedDevice) ? resolvedDevice : [resolvedDevice];

    if (Number.isNaN(resolvedValue)) {
      throw new Error("value parameter must be a number");
    }

    const deviceModels = await Promise.all(
      resolvedDeviceArray.map((device) =>
        this._connectedDevices.getDeviceById(device.referenceId)
      )
    );

    await Promise.all(
      deviceModels.map((device) =>
        device.writeLogicValue(resolvedLogicValue, resolvedValue)
      )
    );
  }
}
