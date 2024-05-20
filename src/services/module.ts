import { composeModules } from "microinject";

import formulaModule from "./formula/module";
import historyModule from "./history/module";
import hmiModule from "./hmi/module";
import pollingModule from "./polling/module";
import stationeersModule from "./stationeers/module";

const servicesModule = composeModules(
  formulaModule,
  historyModule,
  hmiModule,
  pollingModule,
  stationeersModule
);

export default servicesModule;
