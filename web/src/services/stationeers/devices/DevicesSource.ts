import { DeviceModel } from "./DeviceModel";

export interface DevicesSource {
  getDeviceById(referenceId: string): Promise<DeviceModel>;
  getDeviceByDisplayName(displayName: string): Promise<DeviceModel>;
}
