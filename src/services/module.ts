import { composeModules } from "microinject";

import historyModule from "./history/module";
import hmiModule from "./hmi/module";

const servicesModule = composeModules(historyModule, hmiModule);
export default servicesModule;
