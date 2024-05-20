import { ContainerModule } from "microinject";
import { FormulaCompiler } from "./FormulaCompiler";

export default new ContainerModule((bind) => {
  bind(FormulaCompiler);
});
