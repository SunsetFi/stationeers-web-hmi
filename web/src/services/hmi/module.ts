import { ContainerModule } from "microinject";

import { HmiActionExecutor } from "./actions/HmiActionExecutor";
import { WriteLogicValueHmiActionDef } from "./actions/defs/WriteLogicValueHmiActionDef";
import { SetVariableHmiActionDef } from "./actions/defs/SetVariableHmiActionDef";

import { BulkDeviceFormulaObservationSource } from "./formula-sources/BulkDeviceFormulaObservationSource";
import { DeviceFormulaObservationSource } from "./formula-sources/DeviceFormulaObservationSource";

import { HmiScreenRepository } from "./screens/ScreenRepository";

import { HmiContext } from "./HmiContext";
import { HmiConnectedDevicesSource } from "./HmiConnectedDeviceSource";

export default new ContainerModule((bind) => {
  bind(HmiActionExecutor);
  bind(WriteLogicValueHmiActionDef);
  bind(SetVariableHmiActionDef);

  bind(BulkDeviceFormulaObservationSource);
  bind(DeviceFormulaObservationSource);

  bind(HmiScreenRepository);
  bind(HmiContext);
  bind(HmiConnectedDevicesSource);
});
