import { ContainerModule } from "microinject";

import { ReadLogicValueFormulaObservationSource } from "./formula-sources/ReadLogicValueFormulaObservationSource";

import { StationeersApi } from "./StationeersApi";
import {
  StationeersApiUrl,
  stationeersApiUrlFactory,
} from "./StationeersApiUrl";

export default new ContainerModule((bind) => {
  bind(ReadLogicValueFormulaObservationSource);

  bind(StationeersApiUrl)
    .toFactory(stationeersApiUrlFactory)
    .inSingletonScope();
  bind(StationeersApi);
});
