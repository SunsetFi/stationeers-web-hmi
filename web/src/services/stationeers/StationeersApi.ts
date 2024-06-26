import { inject, injectable, singleton } from "microinject";

import { ApiError } from "@/ApiError";

import { DeviceApiObject, DeviceQueryPayload } from "./api-types";

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

  async setLogicValue(referenceId: string, logicValue: string, value: number) {
    const req = await fetch(
      `${this._url}/api/devices/${referenceId}/logic/${logicValue}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      }
    );

    if (req.status !== 200) {
      throw new ApiError(req.status, req.statusText);
    }
  }
}
