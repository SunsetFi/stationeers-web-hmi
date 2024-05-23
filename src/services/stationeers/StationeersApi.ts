import { injectable, singleton } from "microinject";
import { DeviceApiObject } from "./api-types";

@injectable()
@singleton()
export class StationeersApi {
  private readonly _url = "http://localhost:8081/api";

  async getDevice(id: string): Promise<DeviceApiObject | null> {
    console.log("Getting device", id);
    const req = await fetch(`${this._url}/devices/${id}`);

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
    const req = await fetch(`${this._url}/devices`);
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
