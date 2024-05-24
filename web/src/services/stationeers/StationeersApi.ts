import { inject, injectable, singleton } from "microinject";

import { ApiError } from "@/ApiError";

import { DeviceApiObject } from "./api-types";

@injectable()
@singleton()
export class StationeersApi {
  constructor(@inject("StationeersApiUrl") private _url: string) {}

  async getDevice(id: string): Promise<DeviceApiObject | null> {
    console.log("Getting device", id);
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
}
