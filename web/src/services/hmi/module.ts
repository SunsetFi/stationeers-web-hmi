import { ContainerModule } from "microinject";

import { HmiActionExecutor } from "./actions/HmiActionExecutor";

import { BulkDeviceFormulaObservationSource } from "./formula-sources/BulkDeviceFormulaObservationSource";
import { DeviceFormulaObservationSource } from "./formula-sources/DeviceFormulaObservationSource";

import { HmiScreenRepository } from "./screens/ScreenRepository";

import { HmiContext } from "./HmiContext";
import { HmiConnectedDevicesSource } from "./HmiConnectedDeviceSource";
import { WriteLogicValueHmiActionDef } from "./actions/defs/WriteLogicValueHmiActionDef";

export default new ContainerModule((bind) => {
  bind(HmiActionExecutor);
  bind(WriteLogicValueHmiActionDef);

  bind(BulkDeviceFormulaObservationSource);
  bind(DeviceFormulaObservationSource);

  bind(HmiScreenRepository);
  bind(HmiContext);
  bind(HmiConnectedDevicesSource);
});
