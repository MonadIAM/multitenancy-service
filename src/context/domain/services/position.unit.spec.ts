import { describe, expect, it } from "@jest/globals";
import { LockMode } from "@mikro-orm/core";

import { PositionUnitHelpers } from "~testing/unit/domain-service/position.helpers";
import { DepartmentStatus, TeamStatus, PositionReferenceType } from "~context/enums";
import { Exception } from "~common/exceptions";

const REQUEST: Topics.Position.PlacementRequestedMessage["payload"] = {
    actor: "actor-account",
    realm: "organization-realm",
    input: {
        organization: "organization-a",
        process: "placement-process",
        department: "department-a",
        position: "position-a",
        team: "team-a",
    },
};
const PREVIOUS_POSITION = "previous-position";
const helpers = new PositionUnitHelpers();

describe("PositionService", () => {
    describe("validatePlacement", () => {
        it("checks active placement targets in the requested organization and realm with read locks", async () => {
            const { service, repositories, transaction } = helpers.service();

            await service.validatePlacement({ ...REQUEST, transaction: transaction.entityManager });

            expect(repositories.departments.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                    organization: { id: REQUEST.input.organization, realm: REQUEST.realm },
                    status: DepartmentStatus.ACTIVE,
                    id: REQUEST.input.department,
                },
                options: { lockMode: LockMode.PESSIMISTIC_READ },
                transaction: transaction.entityManager,
            });
            expect(repositories.teams.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                    organization: REQUEST.input.organization,
                    department: REQUEST.input.department,
                    status: TeamStatus.ACTIVE,
                    id: REQUEST.input.team,
                },
                options: { lockMode: LockMode.PESSIMISTIC_READ },
                transaction: transaction.entityManager,
            });
        });

        it.each(["departments", "teams"] as const)("propagates the %s lookup failure", async (target) => {
            const { service, repositories, transaction } = helpers.service();
            const error = Exception.notFound({ messageKey: "placement not found" });
            repositories[target].findUniqueOrThrow.mockImplementation(() => Promise.reject(error));

            const result = service.validatePlacement({ ...REQUEST, transaction: transaction.entityManager });

            await expect(result).rejects.toBe(error);
        });
    });

    describe("completeReference", () => {
        it.each([
            { rejected: false, expected: REQUEST.input.position },
            { rejected: true, expected: PREVIOUS_POSITION },
        ])("completes a department manager reference with rejected=$rejected", async ({ rejected, expected }) => {
            const department = helpers.createDepartment({
                managerPosition: REQUEST.input.position,
                previousPosition: PREVIOUS_POSITION,
                process: REQUEST.input.process,
            });
            const { service, repositories, transaction } = helpers.service({ departments: [department] });
            repositories.departments.findUnique.mockImplementation(() => Promise.resolve(department));

            await service.completeReference({
                ...REQUEST,
                input: {
                    type: PositionReferenceType.DEPARTMENT_MANAGER,
                    organization: REQUEST.input.organization,
                    department: REQUEST.input.department,
                    position: REQUEST.input.position,
                    process: REQUEST.input.process,
                },
                transaction: transaction.entityManager,
                rejected,
            });

            expect(repositories.departments.findUnique).toHaveBeenCalledWith({
                where: {
                    id: REQUEST.input.department,
                    organization: REQUEST.input.organization,
                    process: REQUEST.input.process,
                },
                options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                transaction: transaction.entityManager,
            });
            expect(repositories.teams.findUnique).not.toHaveBeenCalled();
            expect(department.managerPosition).toBe(expected);
            expect(department.previousPosition).toBeUndefined();
            expect(department.process).toBeUndefined();
        });

        it.each([
            { rejected: false, expected: REQUEST.input.position },
            { rejected: true, expected: PREVIOUS_POSITION },
        ])("completes a team lead reference with rejected=$rejected", async ({ rejected, expected }) => {
            const team = helpers.createTeam({
                leadPosition: REQUEST.input.position,
                previousPosition: PREVIOUS_POSITION,
                process: REQUEST.input.process,
            });
            const { service, repositories, transaction } = helpers.service({ teams: [team] });
            repositories.teams.findUnique.mockImplementation(() => Promise.resolve(team));

            await service.completeReference({
                ...REQUEST,
                input: { ...REQUEST.input, type: PositionReferenceType.TEAM_LEAD },
                transaction: transaction.entityManager,
                rejected,
            });

            expect(repositories.teams.findUnique).toHaveBeenCalledWith({
                where: {
                    id: REQUEST.input.team,
                    organization: REQUEST.input.organization,
                    process: REQUEST.input.process,
                },
                options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                transaction: transaction.entityManager,
            });
            expect(repositories.departments.findUnique).not.toHaveBeenCalled();
            expect(team.leadPosition).toBe(expected);
            expect(team.previousPosition).toBeUndefined();
            expect(team.process).toBeUndefined();
        });

        it.each([PositionReferenceType.DEPARTMENT_MANAGER, PositionReferenceType.TEAM_LEAD])(
            "ignores a missing target or an already completed process for %s",
            async (type) => {
                const { service, repositories, transaction } = helpers.service();
                const repository =
                    type === PositionReferenceType.DEPARTMENT_MANAGER ? repositories.departments : repositories.teams;
                const id =
                    type === PositionReferenceType.DEPARTMENT_MANAGER ? REQUEST.input.department : REQUEST.input.team;

                const result = service.completeReference({
                    ...REQUEST,
                    input: { ...REQUEST.input, type },
                    transaction: transaction.entityManager,
                    rejected: true,
                });

                await expect(result).resolves.toBeUndefined();
                expect(repository.findUnique).toHaveBeenCalledWith({
                    where: {
                        id,
                        organization: REQUEST.input.organization,
                        process: REQUEST.input.process,
                    },
                    options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                    transaction: transaction.entityManager,
                });
            },
        );
    });

    describe("release", () => {
        it("removes matching manager and lead references with organization-scoped write locks", async () => {
            const departments = [
                helpers.createDepartment({ managerPosition: REQUEST.input.position }),
                helpers.createDepartment({ managerPosition: PREVIOUS_POSITION }),
            ];
            const teams = [
                helpers.createTeam({ leadPosition: REQUEST.input.position }),
                helpers.createTeam({ leadPosition: PREVIOUS_POSITION }),
            ];
            const positions = [REQUEST.input.position, PREVIOUS_POSITION];
            const { service, repositories, transaction } = helpers.service({ departments, teams });

            await service.release({
                ...REQUEST,
                input: { organization: REQUEST.input.organization, positions },
                transaction: transaction.entityManager,
            });

            expect(repositories.departments.find).toHaveBeenCalledWith({
                where: {
                    organization: REQUEST.input.organization,
                    $or: [{ managerPosition: { $in: positions } }, { previousPosition: { $in: positions } }],
                },
                options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                transaction: transaction.entityManager,
            });
            expect(repositories.teams.find).toHaveBeenCalledWith({
                where: {
                    organization: REQUEST.input.organization,
                    $or: [{ leadPosition: { $in: positions } }, { previousPosition: { $in: positions } }],
                },
                options: { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true },
                transaction: transaction.entityManager,
            });
            expect(departments.map((department) => department.managerPosition)).toEqual([undefined, undefined]);
            expect(teams.map((team) => team.leadPosition)).toEqual([undefined, undefined]);
        });

        it("clears rollback references while preserving current references and pending processes", async () => {
            const department = helpers.createDepartment({
                managerPosition: REQUEST.input.position,
                previousPosition: PREVIOUS_POSITION,
                process: REQUEST.input.process,
            });
            const team = helpers.createTeam({
                leadPosition: REQUEST.input.position,
                previousPosition: PREVIOUS_POSITION,
                process: REQUEST.input.process,
            });
            const { service, transaction } = helpers.service({ departments: [department], teams: [team] });

            await service.release({
                ...REQUEST,
                input: { organization: REQUEST.input.organization, positions: [PREVIOUS_POSITION] },
                transaction: transaction.entityManager,
            });

            expect(department.previousPosition).toBeUndefined();
            expect(team.previousPosition).toBeUndefined();
            expect(department.managerPosition).toBe(REQUEST.input.position);
            expect(team.leadPosition).toBe(REQUEST.input.position);
            expect(department.process).toBe(REQUEST.input.process);
            expect(team.process).toBe(REQUEST.input.process);
        });

        it("leaves pending current references for their correlated completion", async () => {
            const department = helpers.createDepartment({
                managerPosition: REQUEST.input.position,
                previousPosition: PREVIOUS_POSITION,
                process: REQUEST.input.process,
            });
            const team = helpers.createTeam({
                leadPosition: REQUEST.input.position,
                previousPosition: PREVIOUS_POSITION,
                process: REQUEST.input.process,
            });
            const { service, transaction } = helpers.service({ departments: [department], teams: [team] });

            await service.release({
                ...REQUEST,
                input: { organization: REQUEST.input.organization, positions: [REQUEST.input.position] },
                transaction: transaction.entityManager,
            });

            expect(department.managerPosition).toBe(REQUEST.input.position);
            expect(team.leadPosition).toBe(REQUEST.input.position);
            expect(department.previousPosition).toBe(PREVIOUS_POSITION);
            expect(team.previousPosition).toBe(PREVIOUS_POSITION);
            expect(department.process).toBe(REQUEST.input.process);
            expect(team.process).toBe(REQUEST.input.process);
        });

        it("accepts positions with no manager or lead references", async () => {
            const { service, transaction } = helpers.service({ departments: [], teams: [] });

            const result = service.release({
                ...REQUEST,
                input: { organization: REQUEST.input.organization, positions: [REQUEST.input.position] },
                transaction: transaction.entityManager,
            });

            await expect(result).resolves.toBeUndefined();
        });

        it.each(["departments", "teams"] as const)(
            "propagates a %s lookup failure without changing either reference",
            async (target) => {
                const department = helpers.createDepartment({ managerPosition: REQUEST.input.position });
                const team = helpers.createTeam({ leadPosition: REQUEST.input.position });
                const { service, repositories, transaction } = helpers.service({
                    departments: [department],
                    teams: [team],
                });
                const error = new Error("lookup failed");
                repositories[target].find.mockImplementation(() => Promise.reject(error));

                const result = service.release({
                    ...REQUEST,
                    input: { organization: REQUEST.input.organization, positions: [REQUEST.input.position] },
                    transaction: transaction.entityManager,
                });

                await expect(result).rejects.toBe(error);
                expect(department.managerPosition).toBe(REQUEST.input.position);
                expect(team.leadPosition).toBe(REQUEST.input.position);
            },
        );
    });
});
