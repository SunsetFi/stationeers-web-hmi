import React from "react";
import { of as observableOf } from "rxjs";

import { useDIDependency } from "@/container";

import { FormulaCompiler } from "@/services/formula/FormulaCompiler";

import { useObservation } from "@/hooks/use-observation";

import { ReactHmiScreenContext } from "./react-context";

export function useHmiScreenContext() {
  const context = React.useContext(ReactHmiScreenContext);
  if (context === null) {
    throw new Error("No HMI screen context available");
  }
  return context;
}

export function useHmiScreenFormulaObservation(
  formula: string | number | boolean
): any {
  const compiler = useDIDependency(FormulaCompiler);
  const context = useHmiScreenContext();
  return useObservation(
    () =>
      typeof formula === "string"
        ? compiler.compileFormula(formula, context)
        : observableOf(formula),
    [formula, context]
  );
}

export function useHmiScreenTemplateStringObservation(
  string: string
): string | undefined {
  const compiler = useDIDependency(FormulaCompiler);
  const context = useHmiScreenContext();
  return useObservation(
    () => compiler.compileTemplateString(string, context),
    [string, context]
  );
}
