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

export interface DeviceQueryPayload {
  referenceIds?: readonly string[];
  prefabNames?: readonly string[];
  prefabHashes?: readonly number[];
  displayNames?: readonly string[];
  dataNetworkIds?: readonly string[];

  matchIntersection?: boolean;
}
export function deviceMatchesQuery(
  device: DeviceApiObject,
  query: DeviceQueryPayload
): boolean {
  if (query.referenceIds && !query.referenceIds.includes(device.referenceId)) {
    return false;
  }

  if (query.prefabNames && !query.prefabNames.includes(device.prefabName)) {
    return false;
  }

  if (query.prefabHashes && !query.prefabHashes.includes(device.prefabHash)) {
    return false;
  }

  if (query.displayNames && !query.displayNames.includes(device.displayName)) {
    return false;
  }

  if (
    query.dataNetworkIds &&
    (!device.dataNetworkId ||
      !query.dataNetworkIds.includes(device.dataNetworkId))
  ) {
    return false;
  }

  return true;
}
