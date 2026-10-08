import { ClassProvider } from "@nestjs/common";

import { ProjectAccountAssignmentService } from "./project-account-assignment.service";
import { OrganizationService } from "./organization.service";
import { MembershipService } from "./membership.service";
import { DepartmentService } from "./department.service";
import { ChangeLogService } from "./change-log.service";
import { AuditLogService } from "./audit-log.service";
import { PositionService } from "./position.service";
import { AccountService } from "./account.service";
import { ProjectService } from "./project.service";
import { InviteService } from "./invite.service";
import { TeamService } from "./team.service";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_SERVICE,
    ORGANIZATION_SERVICE,
    MEMBERSHIP_SERVICE,
    DEPARTMENT_SERVICE,
    CHANGE_LOG_SERVICE,
    AUDIT_LOG_SERVICE,
    POSITION_SERVICE,
    PROJECT_SERVICE,
    ACCOUNT_SERVICE,
    INVITE_SERVICE,
    TEAM_SERVICE,
} from "./tokens";

export const DOMAIN_SERVICES: ClassProvider[] = [
    {
        provide: PROJECT_ACCOUNT_ASSIGNMENT_SERVICE,
        useClass: ProjectAccountAssignmentService,
    },
    {
        provide: ORGANIZATION_SERVICE,
        useClass: OrganizationService,
    },
    {
        provide: MEMBERSHIP_SERVICE,
        useClass: MembershipService,
    },
    {
        provide: DEPARTMENT_SERVICE,
        useClass: DepartmentService,
    },
    {
        provide: CHANGE_LOG_SERVICE,
        useClass: ChangeLogService,
    },
    {
        provide: AUDIT_LOG_SERVICE,
        useClass: AuditLogService,
    },
    {
        provide: POSITION_SERVICE,
        useClass: PositionService,
    },
    {
        provide: ACCOUNT_SERVICE,
        useClass: AccountService,
    },
    {
        provide: PROJECT_SERVICE,
        useClass: ProjectService,
    },
    {
        provide: INVITE_SERVICE,
        useClass: InviteService,
    },
    {
        provide: TEAM_SERVICE,
        useClass: TeamService,
    },
];

export {
    PROJECT_ACCOUNT_ASSIGNMENT_SERVICE,
    ORGANIZATION_SERVICE,
    MEMBERSHIP_SERVICE,
    DEPARTMENT_SERVICE,
    CHANGE_LOG_SERVICE,
    AUDIT_LOG_SERVICE,
    POSITION_SERVICE,
    ACCOUNT_SERVICE,
    PROJECT_SERVICE,
    INVITE_SERVICE,
    TEAM_SERVICE,
};
