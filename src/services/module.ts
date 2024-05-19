import { composeModules } from "microinject";

import historyModule from "./history/module";

const servicesModule = composeModules(historyModule);
export default servicesModule;
