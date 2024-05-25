import { ContainerModule } from "microinject";

import { BulkDeviceFormulaObservationSource } from "./formula-sources/BulkDeviceFormulaObservationSource";
import { DeviceFormulaObservationSource } from "./formula-sources/DeviceFormulaObservationSource";

import { HmiScreenRepository } from "./screens/ScreenRepository";

import { HmiContext } from "./HmiContext";
import { HmiConnectedDevicesSource } from "./HmiConnectedDeviceSource";

export default new ContainerModule((bind) => {
  bind(BulkDeviceFormulaObservationSource);
  bind(DeviceFormulaObservationSource);

  bind(HmiScreenRepository);
  bind(HmiContext);
  bind(HmiConnectedDevicesSource);
});
