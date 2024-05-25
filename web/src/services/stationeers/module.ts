import { ContainerModule } from "microinject";

import { DevicesSource } from "./devices/DevicesSource";
import { StationeersApi } from "./StationeersApi";
import { DeviceFormulaObservationSource } from "./devices/DeviceFormulaObservationSource";
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
  bind(StationeersApi);
});
