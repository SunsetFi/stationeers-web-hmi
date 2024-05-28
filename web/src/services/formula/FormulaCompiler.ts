import { inject, injectable, singleton } from "microinject";
import { Observable, combineLatest, map, of as observableOf } from "rxjs";
import * as math from "mathjs";
import { round } from "lodash";
import {
  ParsedString,
  parseStringTemplateGenerator,
} from "string-template-parser";

import { isNumericString } from "@/utils";

import { FormulaObservationSource } from "./FormulaObservationSource";
import { FormulaContext, NullFormulaContext } from "./FormulaContext";

const NegativeRegex = /(?!x)x/;

const DissallowedMathFunctions = [
  "import",
  "createUnit",
  "evaluate",
  "parse",
  "simplify",
  "derivative",
];

@injectable()
@singleton()
export class FormulaCompiler {
  private readonly _math: math.MathJsInstance;
  private readonly _limitedParse: math.MathJsInstance["parse"];
  private readonly _templateParser: (input: string) => ParsedString;

  constructor(
    @inject(FormulaObservationSource, { all: true })
    private readonly _observationSources: FormulaObservationSource[]
  ) {
    this._math = math.create(math.all);
    this._limitedParse = this._math.parse;

    this._math.createUnit("KPa", "1000 Pa");
    this._math.createUnit("MPa", "1000000 Pa");
    this._math.createUnit("GPa", "1000000000 Pa");

    this._math.createUnit("w", "1 W");
    this._math.createUnit("kw", "1000 W");

    this._math.import(
      {
        import: function () {
          throw new Error("Function import is disabled");
        },
        createUnit: function () {
          throw new Error("Function createUnit is disabled");
        },
        evaluate: function () {
          throw new Error("Function evaluate is disabled");
        },
        parse: function () {
          throw new Error("Function parse is disabled");
        },
        simplify: function () {
          throw new Error("Function simplify is disabled");
        },
        derivative: function () {
          throw new Error("Function derivative is disabled");
        },
      },
      { override: true }
    );

    // This is an egregious abuse of a template parser that is supposed to only be
    // targeting variable names with piped functions, angular style.
    // However, we can force it into something usable for us by messing with its regex settings,
    // and skip having to write the matching and dealing with nesting and escapes ourselves.
    this._templateParser = parseStringTemplateGenerator({
      // The idea of pipes is neat, but we use complex expressions and may want the
      // logical or (||) operator.
      PIPE_START: NegativeRegex,
      PIPE_PARAMETER_START: NegativeRegex,
      // We absolutely need quotes to be passed as-is for string values in the equations, like function arguments.
      QUOTED_STRING: NegativeRegex,
    });
  }

  compileTemplateString(
    string: string,
    context: FormulaContext = NullFormulaContext
  ): Observable<string> {
    const parsed = this._templateParser(string);

    const formulaObservations = parsed.variables.map((variable) =>
      this.compileFormula(variable.name, context)
    );

    if (formulaObservations.length === 0) {
      return observableOf(parsed.literals.join(""));
    }

    return combineLatest(formulaObservations).pipe(
      map((results) => {
        let result = "";
        for (let i = 0; i < parsed.literals.length; i++) {
          result += parsed.literals[i];
          if (i < results.length) {
            result += results[i];
          }
        }
        return result;
      })
    );
  }

  compileFormula(
    expression: string,
    context: FormulaContext = NullFormulaContext
  ): Observable<any> {
    let parsed: math.MathNode;
    try {
      parsed = this._limitedParse(expression);
    } catch (e: any) {
      e.message = `Error parsing formula \"${expression}\": ${e.message}`;
      throw e;
    }

    return this._compileParsedFormula(parsed, context).pipe(
      map((value) => {
        let result: any = value;
        if (math.isUnit(value)) {
          // Get the raw number
          result = value.toNumber();
        }

        // Even when using the round function in equations, rounding jank still happens
        // Limit the precision to trim out the jank
        if (typeof result === "number") {
          // 6 is chosen more or less arbitrarily here.  I don't think we will be called on to display a value
          // with more than this many digits.
          // For completeness, maybe we can do something interesting with computing and limiting the significant figure count.
          result = round(result, 6);
        }

        // If its not a unit, just return the string form regardless of what it is.
        return result;
      })
    );
  }

  private _compileParsedFormula(
    parsed: math.MathNode,
    context: FormulaContext
  ): Observable<any> {
    const observationMappings: Record<string, Observable<any>> = {};
    let observationIndex = 0;
    function registerObservation(observation: Observable<any>): string {
      observationIndex++;

      const variableName = `observation_${observationIndex}`;

      observationMappings[variableName] = observation;

      return variableName;
    }

    const transformed = parsed.transform((node) => {
      this._validateNodeAllowed(node);

      const observation = this._tryResolveObservableNode(node, context);
      if (observation) {
        const variableName = registerObservation(observation);
        return new math.SymbolNode(variableName);
      }

      return node;
    });

    let compiled: math.EvalFunction;

    try {
      compiled = transformed.compile();
    } catch (e: any) {
      e.message = `Error compiling formula \"${parsed.toString()}\": ${e.message}`;
      throw e;
    }

    if (Object.keys(observationMappings).length === 0) {
      // This is a constant expression
      return observableOf(compiled.evaluate({}));
    }

    return combineLatest(observationMappings).pipe(
      map((results) => {
        const scope: Record<string, any> = {
          ...results,
        };

        try {
          return compiled.evaluate(scope);
        } catch (e: any) {
          e.message = `Error evaluating formula \"${parsed.toString()}\": ${e.message}`;
          throw e;
        }
      })
    );
  }

  private _tryResolveObservableNode(
    node: math.MathNode,
    context: FormulaContext
  ): Observable<any> | null {
    if (node.type === "SymbolNode") {
      const symbol = node as math.SymbolNode;

      const contextResolved = context.resolveObservation?.(symbol, (node) =>
        this._compileParsedFormula(node, context)
      );
      if (contextResolved) {
        return contextResolved;
      }

      const observation = this._observationSources.find(
        (o) => o.type === "symbol" && o.name === symbol.name
      );
      if (observation) {
        return observation.resolve([]);
      }
    }

    if (node.type === "FunctionNode") {
      const fn = node as math.FunctionNode;

      const contextResolved = context.resolveObservation?.(fn, (node) =>
        this._compileParsedFormula(node, context)
      );
      if (contextResolved) {
        return contextResolved;
      }

      const observation = this._observationSources.find(
        (o) => o.type === "function" && o.name === fn.fn.name
      );
      if (observation) {
        const args = fn.args.map((arg) =>
          this._compileParsedFormula(arg, context)
        );
        return observation.resolve(args);
      }
    }

    return null;
  }

  private _validateNodeAllowed(node: math.MathNode) {
    if (node.type === "FunctionNode") {
      const fn = node as math.FunctionNode;
      if (DissallowedMathFunctions.includes(fn.fn.name)) {
        throw new Error(`Math function ${fn.fn.name} is not allowed`);
      }
    }
  }
}
