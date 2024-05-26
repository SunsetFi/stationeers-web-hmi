import { Observable } from "rxjs";

import { DeviceModel } from "./DeviceModel";

export interface DevicesSource {
  getDeviceById(referenceId: string): Promise<DeviceModel>;
  getDeviceByDisplayName(displayName: string): Promise<DeviceModel>;
  getDevicesByPrefabName(prefabName: string): Observable<DeviceModel[]>;
}
