import { ContainerModule } from "microinject";
import { PollingScheduler } from "./PollingScheduler";

export default new ContainerModule((bind) => {
  bind(PollingScheduler);
});
