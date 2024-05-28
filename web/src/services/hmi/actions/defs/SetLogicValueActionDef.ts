import { inject, injectable, provides, singleton } from "microinject";

import { DeviceModel } from "@/services/stationeers/devices/DeviceModel";
import { DeviceFormulaObject } from "@/services/stationeers/devices/DeviceFormulaObject";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

import { HmiConnectedDevicesSource } from "../../HmiConnectedDeviceSource";

import { HmiActionDef } from "./HmiActionDef";

@injectable()
@singleton()
@provides(HmiActionDef)
export class SetLogicValueActionDef implements HmiActionDef {
  constructor(
    @inject(HmiConnectedDevicesSource)
    private readonly _connectedDevices: HmiConnectedDevicesSource
  ) {}

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

    const valueArg = args["value"];
    if (valueArg === undefined) {
      throw new Error("value parameter is required");
    }

    const value = Number(valueArg);

    if (Number.isNaN(value)) {
      throw new Error("value parameter must be a number");
    }

    // Resolve them just so we can call awaitNextUpdate
    const resolvedDevices = await Promise.all(
      devices.map((device) =>
        this._connectedDevices.getDeviceById(device.referenceId)
      )
    );

    await Promise.all(
      resolvedDevices
        .filter((device) => device.exists)
        .map((device) => device.writeLogicValue(logicValue, value))
    );
  }
}
