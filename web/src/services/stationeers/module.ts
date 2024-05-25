import { ContainerModule } from "microinject";

import { DeviceFormulaObservationSource } from "./devices/formula-sources/DeviceFormulaObservationSource";
import { DeviceLogicValueFormulaObservationSource } from "./devices/formula-sources/DeviceLogicValueFormulaObservationSource";
import { DevicesSource } from "./devices/DevicesSource";

import { StationeersApi } from "./StationeersApi";
import {
  StationeersApiUrl,
  stationeersApiUrlFactory,
} from "./StationeersApiUrl";

export default new ContainerModule((bind) => {
  bind(StationeersApiUrl)
    .toFactory(stationeersApiUrlFactory)
    .inSingletonScope();
  bind(DeviceFormulaObservationSource);
  bind(DevicesSource);
  bind(DeviceLogicValueFormulaObservationSource);
  bind(StationeersApi);
});
