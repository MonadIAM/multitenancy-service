import { APP_FILTER } from "@nestjs/core";
import { Module } from "@nestjs/common";

import { OrganizationModule } from "~context/organization.module";
import { InfrastructureModule } from "~infrastructure";
import { ExceptionFilter } from "~common/exceptions";
import { ObservabilityModule } from "~observability";
import { SystemModule } from "~common/system.module";

@Module({
    imports: [SystemModule, InfrastructureModule, ObservabilityModule, OrganizationModule],
    providers: [
        {
            provide: APP_FILTER,
            useClass: ExceptionFilter,
        },
    ],
})
export class MainModule {}
