import { ContainerModule } from "microinject";
import { HmiScreenRepository } from "./screens/ScreenRepository";

export default new ContainerModule((bind) => {
  bind(HmiScreenRepository);
});
