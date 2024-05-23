import { ContainerModule } from "microinject";
import { HmiScreenRepository } from "./screens/ScreenRepository";
import { HmiContext } from "./HmiContext";

export default new ContainerModule((bind) => {
  bind(HmiScreenRepository);
  bind(HmiContext);
});
