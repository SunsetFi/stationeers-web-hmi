import { ContainerModule } from "microinject";

import { DevicesSource } from "./DevicesSource";
import { StationeersApi } from "./StationeersApi";
import { DeviceFormulaObservationSource } from "./DeviceFormulaObservationSource";

export default new ContainerModule((bind) => {
  bind(DeviceFormulaObservationSource);
  bind(DevicesSource);
  bind(StationeersApi);
});
