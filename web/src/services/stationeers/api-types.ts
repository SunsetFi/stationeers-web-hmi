import { Tagged } from "type-fest";

const numerics = /^[0-9]+$/;

// Reference IDs are longs, which cannot be represented in javascript.
// The web API uses strings to compensate for this.
export type ReferenceId = Tagged<string, "ReferenceId">;
export function isReferenceId(value: any): value is ReferenceId {
  if (typeof value !== "string") {
    return false;
  }

  return numerics.test(value);
}

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
  dataNetworkId: string | null;
}
