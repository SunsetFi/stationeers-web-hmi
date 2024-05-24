import { Tagged } from "type-fest";

export type ReferenceId = Tagged<string, "ReferenceId">;

export interface LogicValues {
  [key: string]: number;
}

export interface DeviceApiObject {
  referenceId: ReferenceId;
  prefabHash: number;
  prefabName: string;
  health: number;
  customName: string;
  accessState: number;
  displayName: string;
  logicValues: LogicValues;
  logicSlotValues: Record<string, LogicValues>;
  slotReferenceIds: Record<string, ReferenceId>;
}
