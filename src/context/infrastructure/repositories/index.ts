import { ClassProvider } from "@nestjs/common";

import {
    PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY,
    ORG_MEMBERSHIP_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    DEPARTMENT_REPOSITORY,
    CHANGE_LOG_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    PROJECT_REPOSITORY,
    INVITE_REPOSITORY,
    TEAM_REPOSITORY,
} from "~context/domain/repositories";

import { ProjectAccountAssignmentRepository } from "./project-account-assignment.repository";
import { DeptAccountAssignmentRepository } from "./dept-account-assignment.repository";
import { TeamAccountAssignmentRepository } from "./team-account-assignment.repository";
import { OrgMembershipRepository } from "./org-membership.repository";
import { OrganizationRepository } from "./organization.repository";
import { DepartmentRepository } from "./department.repository";
import { ChangeLogRepository } from "./change-log.repository";
import { AuditLogRepository } from "./audit-log.repository";
import { ProjectRepository } from "./project.repository";
import { InviteRepository } from "./invite.repository";
import { TeamRepository } from "./team.repository";

export const REPOSITORIES: ClassProvider[] = [
    {
        provide: PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
        useClass: ProjectAccountAssignmentRepository,
    },
    {
        provide: DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY,
        useClass: DeptAccountAssignmentRepository,
    },
    {
        provide: TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY,
        useClass: TeamAccountAssignmentRepository,
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
        provide: PROJECT_REPOSITORY,
        useClass: ProjectRepository,
    },
    {
        provide: INVITE_REPOSITORY,
        useClass: InviteRepository,
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
        provide: TEAM_REPOSITORY,
        useClass: TeamRepository,
    },
];

export {
    PROJECT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    DEPT_ACCOUNT_ASSIGNMENT_REPOSITORY,
    TEAM_ACCOUNT_ASSIGNMENT_REPOSITORY,
    ORG_MEMBERSHIP_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    DEPARTMENT_REPOSITORY,
    CHANGE_LOG_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    PROJECT_REPOSITORY,
    INVITE_REPOSITORY,
    TEAM_REPOSITORY,
};
