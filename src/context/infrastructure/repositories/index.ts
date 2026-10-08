import { ClassProvider } from "@nestjs/common";

import { ProjectAccountAssignmentRepository } from "./project-account-assignment.repository";
import { DepartmentClosureRepository } from "./department-closure.repository";
import { OrgMembershipRepository } from "./org-membership.repository";
import { OrganizationRepository } from "./organization.repository";
import { DepartmentRepository } from "./department.repository";
import { ChangeLogRepository } from "./change-log.repository";
import { AuditLogRepository } from "./audit-log.repository";
import { ProjectRepository } from "./project.repository";
import { InviteRepository } from "./invite.repository";
import { TeamRepository } from "./team.repository";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    DEPARTMENT_CLOSURE_REPOSITORY,
    ORG_MEMBERSHIP_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    DEPARTMENT_REPOSITORY,
    CHANGE_LOG_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    PROJECT_REPOSITORY,
    INVITE_REPOSITORY,
    TEAM_REPOSITORY,
} from "./tokens";

export const REPOSITORIES: ClassProvider[] = [
    {
        provide: PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
        useClass: ProjectAccountAssignmentRepository,
    },
    {
        provide: DEPARTMENT_CLOSURE_REPOSITORY,
        useClass: DepartmentClosureRepository,
    },
    {
        provide: ORG_MEMBERSHIP_REPOSITORY,
        useClass: OrgMembershipRepository,
    },
    {
        provide: ORGANIZATION_REPOSITORY,
        useClass: OrganizationRepository,
    },
    {
        provide: DEPARTMENT_REPOSITORY,
        useClass: DepartmentRepository,
    },
    {
        provide: CHANGE_LOG_REPOSITORY,
        useClass: ChangeLogRepository,
    },
    {
        provide: AUDIT_LOG_REPOSITORY,
        useClass: AuditLogRepository,
    },
    {
        provide: PROJECT_REPOSITORY,
        useClass: ProjectRepository,
    },
    {
        provide: INVITE_REPOSITORY,
        useClass: InviteRepository,
    },
    {
        provide: TEAM_REPOSITORY,
        useClass: TeamRepository,
    },
];

export {
    PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    DEPARTMENT_CLOSURE_REPOSITORY,
    ORG_MEMBERSHIP_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    DEPARTMENT_REPOSITORY,
    CHANGE_LOG_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    PROJECT_REPOSITORY,
    INVITE_REPOSITORY,
    TEAM_REPOSITORY,
};
