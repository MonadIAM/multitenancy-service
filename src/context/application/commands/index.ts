import { ClassProvider } from "@nestjs/common";

import { ProjectAccountAssignmentCommands } from "./project-account-assignment.commands";
import { OrgMembershipCommands } from "./org-membership.commands";
import { OrganizationCommands } from "./organization.commands";
import { DepartmentCommands } from "./department.commands";
import { PositionCommands } from "./position.commands";
import { AccountCommands } from "./account.commands";
import { ProjectCommands } from "./project.commands";
import { InviteCommands } from "./invite.commands";
import { TeamCommands } from "./team.commands";
import {
    PROJECT_ACCOUNT_ASSIGNMENT_COMMANDS,
    ORG_MEMBERSHIP_COMMANDS,
    ORGANIZATION_COMMANDS,
    DEPARTMENT_COMMANDS,
    POSITION_COMMANDS,
    ACCOUNT_COMMANDS,
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
        provide: POSITION_COMMANDS,
        useClass: PositionCommands,
    },
    {
        provide: ACCOUNT_COMMANDS,
        useClass: AccountCommands,
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
    ORG_MEMBERSHIP_COMMANDS,
    ORGANIZATION_COMMANDS,
    DEPARTMENT_COMMANDS,
    POSITION_COMMANDS,
    ACCOUNT_COMMANDS,
    PROJECT_COMMANDS,
    INVITE_COMMANDS,
    TEAM_COMMANDS,
};
