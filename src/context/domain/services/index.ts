import { ClassProvider } from "@nestjs/common";

import { ProjectAccountAssignmentService } from "./project-account-assignment.service";
import { DeptAccountAssignmentService } from "./dept-account-assignment.service";
import { TeamAccountAssignmentService } from "./team-account-assignment.service";
import { OrgMembershipService } from "./org-membership.service";
import { OrganizationService } from "./organization.service";
import { DepartmentService } from "./department.service";
import { ChangeLogService } from "./change-log.service";
import { AuditLogService } from "./audit-log.service";
import { ProjectService } from "./project.service";
import { InviteService } from "./invite.service";
import { TeamService } from "./team.service";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_SERVICE,
    DEPT_ACCOUNT_ASSIGNMENT_SERVICE,
    TEAM_ACCOUNT_ASSIGNMENT_SERVICE,
    ORG_MEMBERSHIP_SERVICE,
    ORGANIZATION_SERVICE,
    DEPARTMENT_SERVICE,
    CHANGE_LOG_SERVICE,
    AUDIT_LOG_SERVICE,
    PROJECT_SERVICE,
    INVITE_SERVICE,
    TEAM_SERVICE,
} from "./tokens";

export const DOMAIN_SERVICES: ClassProvider[] = [
    {
        provide: PROJECT_ACCOUNT_ASSIGNMENT_SERVICE,
        useClass: ProjectAccountAssignmentService,
    },
    {
        provide: DEPT_ACCOUNT_ASSIGNMENT_SERVICE,
        useClass: DeptAccountAssignmentService,
    },
    {
        provide: TEAM_ACCOUNT_ASSIGNMENT_SERVICE,
        useClass: TeamAccountAssignmentService,
    },
    {
        provide: ORG_MEMBERSHIP_SERVICE,
        useClass: OrgMembershipService,
    },
    {
        provide: ORGANIZATION_SERVICE,
        useClass: OrganizationService,
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
    DEPT_ACCOUNT_ASSIGNMENT_SERVICE,
    TEAM_ACCOUNT_ASSIGNMENT_SERVICE,
    ORG_MEMBERSHIP_SERVICE,
    ORGANIZATION_SERVICE,
    DEPARTMENT_SERVICE,
    CHANGE_LOG_SERVICE,
    AUDIT_LOG_SERVICE,
    PROJECT_SERVICE,
    INVITE_SERVICE,
    TEAM_SERVICE,
};
