import { jest } from "@jest/globals";

import { RepositoryMockBank } from "./repository-mock-bank.helpers";

export class ServiceMockBank extends RepositoryMockBank implements Unit.Domain.ServiceMockBank.Contract {
    public services(): Unit.Domain.ServiceMocks.Contract {
        return {
            projectAssignments: { clean: jest.fn(() => Promise.resolve([])) },
            departmentAssignments: {
                clean: jest.fn(() => Promise.resolve([])),
            },
            teamAssignments: { clean: jest.fn(() => Promise.resolve([])) },
            memberships: {
                join: jest.fn(() => Promise.resolve(this.createOrgMembership())),
            },
        };
    }
}
