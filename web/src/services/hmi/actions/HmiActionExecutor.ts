import { inject, injectable, singleton } from "microinject";

import { HmiScreenContext } from "../screens/HmiScreenContext";

import { HmiActionDef } from "./defs/HmiActionDef";

import { HmiAction } from "./types";

@injectable()
@singleton()
export class HmiActionExecutor {
  constructor(
    @inject(HmiActionDef, { all: true })
    private readonly _defs: HmiActionDef[]
  ) {}

  async executeAction(context: HmiScreenContext, action: HmiAction) {
    const def = this._defs.find((d) => d.type === action.type);
    if (!def) {
      throw new Error(`Unknown action type: ${action.type}`);
    }

    await def.execute(context, action);
  }
}
