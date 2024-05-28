import { ContainerModule } from "microinject";

import { HmiActionExecutor } from "./actions/HmiActionExecutor";

import { BulkDeviceFormulaObservationSource } from "./formula-sources/BulkDeviceFormulaObservationSource";
import { DeviceFormulaObservationSource } from "./formula-sources/DeviceFormulaObservationSource";

import { HmiScreenRepository } from "./screens/ScreenRepository";

import { HmiContext } from "./HmiContext";
import { HmiConnectedDevicesSource } from "./HmiConnectedDeviceSource";
import { SetLogicValueActionDef } from "./actions/defs/SetLogicValueActionDef";

export default new ContainerModule((bind) => {
  bind(HmiActionExecutor);
  bind(SetLogicValueActionDef);

  bind(BulkDeviceFormulaObservationSource);
  bind(DeviceFormulaObservationSource);

  bind(HmiScreenRepository);
  bind(HmiContext);
  bind(HmiConnectedDevicesSource);
});
