import { describe, expect, it } from "@jest/globals";

import { EntityFactoryRegistry } from "~testing/entity-factory.registry";
import { PositionReferenceType } from "~context/enums";

import { TeamMapper } from "./team.mapper";

const helpers = new EntityFactoryRegistry();
const mapper = new TeamMapper();
const REALM = "organization-realm";
const POSITION = "position-a";
const ACTOR = "actor-account";

describe("TeamMapper", () => {
    describe("referencePayload", () => {
        it("maps the current position, hierarchy and process without exposing rollback state", () => {
            const team = helpers.createTeam();
            team.assignLead({ position: "previous-position" });
            team.completePosition(false);
            team.assignLead({ position: POSITION });

            const result = mapper.referencePayload({ team, actor: ACTOR, realm: REALM });

            expect(result).toEqual([
                {
                    actor: ACTOR,
                    realm: REALM,
                    input: {
                        type: PositionReferenceType.TEAM_LEAD,
                        organization: team.organization.id,
                        department: team.department.id,
                        team: team.id,
                        position: POSITION,
                        process: team.process,
                    },
                },
            ]);
            expect(team.previousPosition).toBe("previous-position");
        });

        it("does not request validation for a confirmed reference", () => {
            const team = helpers.createTeam();
            team.assignLead({ position: POSITION });
            team.completePosition(false);

            const result = mapper.referencePayload({ team, actor: ACTOR, realm: REALM });

            expect(result).toEqual([]);
            expect(team.leadPosition).toBe(POSITION);
        });

        it("does not request validation after the reference is removed", () => {
            const team = helpers.createTeam();
            team.assignLead({ position: POSITION });
            team.unassignLead();

            const result = mapper.referencePayload({ team, actor: ACTOR, realm: REALM });

            expect(result).toEqual([]);
        });
    });

    describe("purgePayload", () => {
        it("keeps each deleted team associated with its own organization", () => {
            const first = helpers.createTeam();
            const second = helpers.createTeam();

            const result = mapper.purgePayload({ teams: [first, second], actor: ACTOR, realm: REALM });

            expect(result).toEqual([
                { actor: ACTOR, realm: REALM, input: { organization: first.organization.id, team: first.id } },
                { actor: ACTOR, realm: REALM, input: { organization: second.organization.id, team: second.id } },
            ]);
        });

        it("does not emit cleanup events when no entities were removed", () => {
            const teams: Entities.Team[] = [];

            const result = mapper.purgePayload({ teams, actor: ACTOR, realm: REALM });

            expect(result).toEqual([]);
        });
    });
});
