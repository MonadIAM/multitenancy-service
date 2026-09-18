import { ClassProvider } from "@nestjs/common";

import { ProjectAccountAssignmentCommands } from "./project-account-assignment.commands";
import { DeptAccountAssignmentCommands } from "./dept-account-assignment.commands";
import { TeamAccountAssignmentCommands } from "./team-account-assignment.commands";
import { OrgMembershipCommands } from "./org-membership.commands";
import { OrganizationCommands } from "./organization.commands";
import { DepartmentCommands } from "./department.commands";
import { ProjectCommands } from "./project.commands";
import { InviteCommands } from "./invite.commands";
import { TeamCommands } from "./team.commands";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_COMMANDS,
    DEPT_ACCOUNT_ASSIGNMENT_COMMANDS,
    TEAM_ACCOUNT_ASSIGNMENT_COMMANDS,
    ORG_MEMBERSHIP_COMMANDS,
    ORGANIZATION_COMMANDS,
    DEPARTMENT_COMMANDS,
    PROJECT_COMMANDS,
    INVITE_COMMANDS,
    TEAM_COMMANDS,
} from "./tokens";

export const COMMANDS: ClassProvider[] = [
    {
        provide: PROJECT_ACCOUNT_ASSIGNMENT_COMMANDS,
        useClass: ProjectAccountAssignmentCommands,
    },
    {
        provide: DEPT_ACCOUNT_ASSIGNMENT_COMMANDS,
        useClass: DeptAccountAssignmentCommands,
    },
    {
        provide: TEAM_ACCOUNT_ASSIGNMENT_COMMANDS,
        useClass: TeamAccountAssignmentCommands,
    },
    {
        provide: ORG_MEMBERSHIP_COMMANDS,
        useClass: OrgMembershipCommands,
    },
    {
        provide: ORGANIZATION_COMMANDS,
        useClass: OrganizationCommands,
    },
    {
        provide: DEPARTMENT_COMMANDS,
        useClass: DepartmentCommands,
    },
    {
        provide: PROJECT_COMMANDS,
        useClass: ProjectCommands,
    },
    {
        provide: INVITE_COMMANDS,
        useClass: InviteCommands,
    },
    {
        provide: TEAM_COMMANDS,
        useClass: TeamCommands,
    },
];

export {
    PROJECT_ACCOUNT_ASSIGNMENT_COMMANDS,
    DEPT_ACCOUNT_ASSIGNMENT_COMMANDS,
    TEAM_ACCOUNT_ASSIGNMENT_COMMANDS,
    ORG_MEMBERSHIP_COMMANDS,
    ORGANIZATION_COMMANDS,
    DEPARTMENT_COMMANDS,
    PROJECT_COMMANDS,
    INVITE_COMMANDS,
    TEAM_COMMANDS,
};
