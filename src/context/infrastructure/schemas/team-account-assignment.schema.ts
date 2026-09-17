import { EntitySchema } from "@mikro-orm/postgresql";

import { TeamAccountAssignment } from "~context/domain/entities/team-account-assignment.entity";
import { OrgMembership } from "~context/domain/entities/org-membership.entity";
import { Organization } from "~context/domain/entities/organization.entity";
import { Team } from "~context/domain/entities/team.entity";
import { AssignmentStatus } from "~context/enums";

export const TeamAccountAssignmentSchema = new EntitySchema<TeamAccountAssignment>({
    class: TeamAccountAssignment,
    tableName: "team_account_assignment",
    schema: "multitenancy",

    uniques: [
        {
            name: "team_account_assignment_membership_team_unique",
            columns: [{ name: "membership_id" }, { name: "team_id" }],
        },
        {
            name: "team_account_assignment_id_team_unique",
            columns: [{ name: "id" }, { name: "team_id" }],
        },
    ],

    indexes: [{ name: "team_account_assignment_team_idx", columns: [{ name: "team_id" }] }],

    properties: {
        id: { primary: true, type: "uuid" },
        organization: {
            kind: "m:1",
            entity: () => Organization,
            fieldName: "organization_id",
            deleteRule: "restrict",
        },
        membership: {
            kind: "m:1",
            entity: () => OrgMembership,
            joinColumns: ["membership_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["membership_id"],
            deleteRule: "restrict",
            foreignKeyName: "team_assignment_membership_organization_fk",
        },
        team: {
            kind: "m:1",
            entity: () => Team,
            joinColumns: ["team_id", "organization_id"],
            columnTypes: ["uuid", "uuid"],
            referencedColumnNames: ["id", "organization_id"],
            ownColumns: ["team_id"],
            inversedBy: "assignments",
            deleteRule: "restrict",
            foreignKeyName: "team_assignment_team_organization_fk",
        },
        status: {
            enum: true,
            items: () => AssignmentStatus,
            nativeEnumName: "assignment_status",
        },
        assignedBy: { type: "uuid", fieldName: "assigned_by" },
        assignedAt: { type: "timestamptz", length: 3 },
        updatedAt: { type: "timestamptz", length: 3, nullable: true },
        version: { type: "int", version: true },
    },
});
