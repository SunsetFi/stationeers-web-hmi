import { Identifier } from "microinject";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

export const HmiActionDef: Identifier<HmiActionDef> = "HmiActionDef";
export interface HmiActionDef {
  readonly type: string;
  execute(context: HmiScreenContext, args: Record<string, any>): Promise<void>;
}
