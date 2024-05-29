import { BehaviorSubject, Observable, map, switchMap } from "rxjs";
import * as math from "mathjs";

import { observeAll } from "@/observables";

import { FormulaContext } from "@/services/formula/FormulaContext";
import { FormulaCompiler } from "@/services/formula/FormulaCompiler";
import { DevicesSource } from "@/services/stationeers";
import { modelToDeviceFormulaObject } from "@/services/stationeers/devices/DeviceFormulaObject";
import { isReferenceId } from "@/services/stationeers/api-types";

import { Widget } from "../widgets";

import { HmiScreen } from "./types";

export class HmiScreenContext implements FormulaContext {
  private readonly _variables = new Map<
    string,
    BehaviorSubject<string | number | boolean | null>
  >();
  private readonly _definitions = new Map<string, Observable<any>>();

  constructor(
    private readonly _screen: HmiScreen,
    private readonly _devicesSource: DevicesSource,
    private readonly _formulaCompiler: FormulaCompiler
  ) {
    for (const [key, value] of Object.entries(this._screen.variables || {})) {
      this._variables.set(key, new BehaviorSubject(value));
    }
    for (const [key, value] of Object.entries(this._screen.definitions || {})) {
      this._definitions.set(key, this._formulaCompiler.compileFormula(value));
    }
  }

  get title(): string {
    return this._screen.title;
  }

  get root(): Widget {
    return this._screen.root;
  }

  setVariable(name: string, value: string | number | boolean | null) {
    const observable = this._variables.get(name);
    if (!observable) {
      throw new Error("Variable is not defined.");
    }

    observable.next(value);
  }

  resolveObservation(
    node: math.FunctionNode | math.SymbolNode,
    compile: (node: math.MathNode) => Observable<any>
  ): Observable<any> | null {
    if (math.isSymbolNode(node)) {
      const dataSource =
        this._definitions.get(node.name) ?? this._variables.get(node.name);
      if (dataSource) {
        return dataSource;
      }
    } else if (math.isFunctionNode(node)) {
      return this._resolveFunction(node, compile);
    }

    return null;
  }

  private _resolveFunction(
    node: math.FunctionNode,
    compile: (node: math.MathNode) => Observable<any>
  ): Observable<any> | null {
    switch (node.fn.name) {
      case "devicesByPrefab":
        return this._resolveDevicesByPrefab(node, compile);
      case "device":
        return this._resolveDevice(node, compile);
    }
    return null;
  }

  private _resolveDevice(
    node: math.FunctionNode,
    compile: (node: math.MathNode) => Observable<any>
  ): Observable<any> | null {
    if (node.args.length !== 1) {
      throw new Error("device requires 1 argument.");
    }

    const deviceId$ = compile(node.args[0]);

    return deviceId$.pipe(
      switchMap((deviceId) => {
        if (isReferenceId(deviceId) || typeof deviceId === "number") {
          return this._devicesSource.getDeviceById(String(deviceId));
        } else if (typeof deviceId === "string") {
          return this._devicesSource.getDeviceByDisplayName(deviceId);
        } else {
          throw new Error("Invalid device ID.");
        }
      }),
      switchMap((device) => modelToDeviceFormulaObject(device))
    );
  }

  private _resolveDevicesByPrefab(
    node: math.FunctionNode,
    compile: (node: math.MathNode) => Observable<any>
  ): Observable<any> | null {
    if (node.args.length !== 1) {
      throw new Error("devicesByPrefab requires 1 argument.");
    }

    const prefabName$ = compile(node.args[0]);

    return prefabName$.pipe(
      switchMap((prefabName) => {
        return this._devicesSource.getDevicesByPrefabName(prefabName).pipe(
          map((devices) =>
            devices.map((device) => modelToDeviceFormulaObject(device))
          ),
          observeAll()
        );
      })
    );
  }
}
