import { APP_FILTER } from "@nestjs/core";
import { Module } from "@nestjs/common";

import { MultitenancyModule } from "~context/multitenancy.module";
import { InfrastructureModule } from "~infrastructure";
import { ExceptionFilter } from "~common/exceptions";
import { ObservabilityModule } from "~observability";
import { SystemModule } from "~common/system.module";

@Module({
    imports: [SystemModule, InfrastructureModule, ObservabilityModule, MultitenancyModule],
    providers: [
        {
            provide: APP_FILTER,
            useClass: ExceptionFilter,
        },
    ],
})
export class MainModule {}
