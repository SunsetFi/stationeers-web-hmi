import { Identifier } from "microinject";

import { HmiScreenContext } from "../../screens/HmiScreenContext";

import { HmiAction, HmiActionBase } from "../types";

export const HmiActionDef: Identifier<HmiActionDef> = "HmiActionDef";
export interface HmiActionDef<T extends HmiActionBase = HmiActionBase> {
  readonly type: string;
  execute(context: HmiScreenContext, action: T): Promise<void>;
}
