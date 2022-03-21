/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as fs from "fs";
import { IEventListener, PlatformEvent } from "../common/Exports";
import { EventType } from "../sdk/Exports";
import { Contracts } from "../sdk/Contracts";

export class ConsoleLoggingListener implements IEventListener<PlatformEvent> {
    private privLogLevelFilter: EventType;
    private privLogPath: fs.PathLike = undefined;

    public constructor(logLevelFilter: EventType = EventType.None) { // Console output disabled by default
        this.privLogLevelFilter = logLevelFilter;
    }

    public set logPath(path: fs.PathLike) {
        Contracts.throwIfNullOrUndefined(fs.openSync, "\nFile System access not available");
        this.privLogPath = path;
    }

    public onEvent(event: PlatformEvent): void {
        if (event.eventType >= this.privLogLevelFilter) {
            const log = this.toString(event);
            if (!!this.privLogPath) {
                fs.writeFileSync(this.privLogPath, log);
            }

            switch (event.eventType) {
                case EventType.Debug:
                    // eslint-disable-next-line no-console
                    console.debug(log);
                    break;
                case EventType.Info:
                    // eslint-disable-next-line no-console
                    console.info(log);
                    break;
                case EventType.Warning:
                    // eslint-disable-next-line no-console
                    console.warn(log);
                    break;
                case EventType.Error:
                    // eslint-disable-next-line no-console
                    console.error(log);
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.log(log);
                    break;
            }
        }
    }

    private toString(event: PlatformEvent): string {
        const logFragments = [
            `${event.eventTime}`,
            `${event.name}`,
        ];

        const e: any = event as any;
        for (const prop in e) {
            if (prop && event.hasOwnProperty(prop) &&
                prop !== "eventTime" && prop !== "eventType" &&
                prop !== "eventId" && prop !== "name" &&
                prop !== "constructor") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const value = e[prop];
                let valueToLog = "<NULL>";
                if (value !== undefined && value !== null) {
                    if (typeof (value) === "number" || typeof (value) === "string") {
                        valueToLog = value.toString();
                    } else {
                        valueToLog = JSON.stringify(value);
                    }
                }

                logFragments.push(`${prop}: ${valueToLog}`);
            }

        }

        return logFragments.join(" | ");
    }
}
