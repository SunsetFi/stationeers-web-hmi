import { inject, injectable, singleton } from "microinject";
import { map } from "rxjs";

import { QueryingDevicesSource } from "../stationeers/devices/QueryingDevicesSource";
import { StationeersApi } from "../stationeers/StationeersApi";

import { PollingScheduler } from "../polling";

import { HmiContext } from "./HmiContext";

@injectable()
@singleton()
export class HmiConnectedDevicesSource extends QueryingDevicesSource {
  constructor(
    @inject(PollingScheduler) pollingScheduler: PollingScheduler,
    @inject(StationeersApi) api: StationeersApi,
    @inject(HmiContext) hmiContext: HmiContext
  ) {
    super(
      pollingScheduler,
      api,
      hmiContext.dataNetworkId$.pipe(
        // Note: This is a little hacky; we want to not match anything if the data network ID is null.
        map((id) => ({ dataNetworkIds: [id ?? "none"] }))
      )
    );
  }
}
