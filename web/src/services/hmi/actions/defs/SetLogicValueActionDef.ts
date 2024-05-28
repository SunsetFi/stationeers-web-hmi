import { inject, injectable, provides, singleton } from "microinject";

import { StationeersApi } from "@/services/stationeers/StationeersApi";
import { DeviceModel } from "@/services/stationeers/devices/DeviceModel";
import { DeviceFormulaObject } from "@/services/stationeers/devices/DeviceFormulaObject";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

import { HmiActionDef } from "./HmiActionDef";

@injectable()
@singleton()
@provides(HmiActionDef)
export class SetLogicValueActionDef implements HmiActionDef {
  constructor(@inject(StationeersApi) private stationeersApi: StationeersApi) {}

  get type() {
    return "writeLogicValue";
  }

  async execute(
    context: HmiScreenContext,
    args: Record<string, any>
  ): Promise<void> {
    const devicesArg = args["device"];
    if (!devicesArg) {
      throw new Error("device parameter is required");
    }

    const devices: (DeviceModel | DeviceFormulaObject)[] = Array.isArray(
      devicesArg
    )
      ? devicesArg
      : [devicesArg];

    const logicValue = args["logicValue"];
    if (!logicValue) {
      throw new Error("logicValue parameter is required");
    }

    const value = args["value"];
    if (value === undefined) {
      throw new Error("value parameter is required");
    }

    if (typeof value !== "number") {
      throw new Error("value parameter must be a number");
    }

    if (Number.isNaN(value)) {
      return;
    }

    await Promise.all(
      devices
        .filter((device) => device.exists)
        .map((device) =>
          this.stationeersApi.setLogicValue(
            device.referenceId,
            String(logicValue),
            Number(value)
          )
        )
    );
  }
}
