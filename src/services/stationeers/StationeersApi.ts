import { injectable, singleton } from "microinject";
import { DeviceModel } from "./DevicesSource";
import { DeviceApiObject } from "./api-types";

@injectable()
@singleton()
export class StationeersApi {
  private readonly _url = "http://localhost:8081/api";

  async getDevices(): Promise<DeviceApiObject[]> {
    return this._get("devices");
  }

  private async _get(path: string) {
    const req = await fetch(`${this._url}/${path}`);
    if (req.status !== 200) {
      throw new ApiError(req.status, req.statusText);
    }

    const body = await req.json();
    return body;
  }
}

export class ApiError extends Error {
  statusCode: number;
  statusMessage: string;

  constructor(statusCode: number, statusMessage: string) {
    super(`${statusCode}: ${statusMessage}`);
    this.message = `${statusCode}: ${statusMessage}`;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
