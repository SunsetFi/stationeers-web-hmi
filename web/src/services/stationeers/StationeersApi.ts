import { inject, injectable, singleton } from "microinject";

import { ApiError } from "@/ApiError";

import { DeviceApiObject } from "./api-types";

export interface DeviceQueryPayload {
  referenceIds?: readonly string[];
  prefabNames?: readonly string[];
  prefabHashes?: readonly number[];
  displayNames?: readonly string[];
  cableNetworkIds?: readonly string[];

  matchIntersection?: boolean;
}

@injectable()
@singleton()
export class StationeersApi {
  constructor(@inject("StationeersApiUrl") private _url: string) {}

  async getDevice(id: string): Promise<DeviceApiObject | null> {
    const req = await fetch(`${this._url}/api/devices/${id}`);

    if (req.status === 404) {
      return null;
    }

    if (req.status !== 200) {
      throw new ApiError(req.status, req.statusText);
    }

    const body = await req.json();
    return body;
  }

  async getDevices(): Promise<DeviceApiObject[]> {
    const req = await fetch(`${this._url}/api/devices`);
    if (req.status !== 200) {
      throw new ApiError(req.status, req.statusText);
    }

    const body = await req.json();
    return body;
  }

  async queryDevices(query: DeviceQueryPayload): Promise<DeviceApiObject[]> {
    const req = await fetch(`${this._url}/api/devices/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    if (req.status !== 200) {
      throw new ApiError(req.status, req.statusText);
    }

    const body = await req.json();
    return body;
  }
}
