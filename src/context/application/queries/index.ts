import { ClassProvider } from "@nestjs/common";

import { ProjectAccountAssignmentQueries } from "./project-account-assignment.queries";
import { OrgMembershipQueries } from "./org-membership.queries";
import { OrganizationQueries } from "./organization.queries";
import { DepartmentQueries } from "./department.queries";
import { ChangeLogQueries } from "./change-log.queries";
import { AuditLogQueries } from "./audit-log.queries";
import { ProjectQueries } from "./project.queries";
import { InviteQueries } from "./invite.queries";
import { TeamQueries } from "./team.queries";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_QUERIES,
    ORG_MEMBERSHIP_QUERIES,
    ORGANIZATION_QUERIES,
    DEPARTMENT_QUERIES,
    CHANGE_LOG_QUERIES,
    AUDIT_LOG_QUERIES,
    PROJECT_QUERIES,
    INVITE_QUERIES,
    TEAM_QUERIES,
} from "./tokens";

export const QUERIES: ClassProvider[] = [
    {
        provide: PROJECT_ACCOUNT_ASSIGNMENT_QUERIES,
        useClass: ProjectAccountAssignmentQueries,
    },
    {
        provide: ORG_MEMBERSHIP_QUERIES,
        useClass: OrgMembershipQueries,
    },
    {
        provide: ORGANIZATION_QUERIES,
        useClass: OrganizationQueries,
    },
    {
        provide: DEPARTMENT_QUERIES,
        useClass: DepartmentQueries,
    },
    {
        provide: CHANGE_LOG_QUERIES,
        useClass: ChangeLogQueries,
    },
    {
        provide: AUDIT_LOG_QUERIES,
        useClass: AuditLogQueries,
    },
    {
        provide: PROJECT_QUERIES,
        useClass: ProjectQueries,
    },
    {
        provide: INVITE_QUERIES,
        useClass: InviteQueries,
    },
    {
        provide: TEAM_QUERIES,
        useClass: TeamQueries,
    },
];

export {
    PROJECT_ACCOUNT_ASSIGNMENT_QUERIES,
    ORG_MEMBERSHIP_QUERIES,
    ORGANIZATION_QUERIES,
    DEPARTMENT_QUERIES,
    CHANGE_LOG_QUERIES,
    AUDIT_LOG_QUERIES,
    PROJECT_QUERIES,
    INVITE_QUERIES,
    TEAM_QUERIES,
};
