import { inject, injectable, singleton } from "microinject";
import { Observable, combineLatest, map, of as observableOf } from "rxjs";
import * as math from "mathjs";
import {
  ParsedString,
  parseStringTemplateGenerator,
} from "string-template-parser";

import { FormulaObservationSource } from "./FormulaObservationSource";

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

    this._templateParser = parseStringTemplateGenerator({
      // The idea of pipes is neat, but we use complex expressions and may want the
      // logical or (||) operator.
      PIPE_START: NegativeRegex,
      PIPE_PARAMETER_START: NegativeRegex,
      QUOTED_STRING: NegativeRegex,
    });
  }

  compileTemplateString(string: string): Observable<string> {
    const parsed = this._templateParser(string);

    const formulaObservations = parsed.variables.map((variable) =>
      this.compileFormula(variable.name)
    );

    if (formulaObservations.length === 0) {
      return new Observable((subscriber) => {
        subscriber.next(parsed.literals.join(""));
        subscriber.complete();
      });
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

  compileFormula(expression: string): Observable<string> {
    const parsed = this._limitedParse(expression);

    return this._compileParsedFormula(parsed).pipe(
      map((value) => value.toString())
    );
  }

  private _compileParsedFormula(parsed: math.MathNode): Observable<any> {
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

      const observation = this._tryResolveObservableNode(node);
      if (observation) {
        const variableName = registerObservation(observation);
        return new math.SymbolNode(variableName);
      }

      return node;
    });

    const compiled = transformed.compile();

    if (Object.keys(observationMappings).length === 0) {
      // This is a constant expression
      return observableOf(compiled.evaluate({}));
    }

    return combineLatest(observationMappings).pipe(
      map((results) => {
        console.log("Got observations for", parsed.toString());
        const scope: Record<string, any> = {
          ...results,
        };

        const result = compiled.evaluate(scope);
        console.log("result is", result);
        return result;
      })
    );
  }

  private _tryResolveObservableNode(
    node: math.MathNode
  ): Observable<any> | null {
    if (node.type === "SymbolNode") {
      const symbol = node as math.SymbolNode;
      const observation = this._observationSources.find(
        (o) => o.type === "symbol" && o.name === symbol.name
      );
      if (observation) {
        return observation.resolve([]);
      }
    }

    if (node.type === "FunctionNode") {
      const fn = node as math.FunctionNode;
      const observation = this._observationSources.find(
        (o) => o.type === "function" && o.name === fn.fn.name
      );
      if (observation) {
        const args = fn.args.map((arg) => this._compileParsedFormula(arg));
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
