import { jest } from "@jest/globals";

import { DepartmentService } from "~context/domain/services/department.service";

import { DomainServiceCoreUnitHelpers } from "../core.helpers";

export class DepartmentUnitHelpers extends DomainServiceCoreUnitHelpers implements Unit.Domain.Department.Contract {
    public service(props: Unit.Domain.Department.Service.Props = {}): Unit.Domain.Department.Service.Result {
        const repositories = this.repositories(props);
        return {
            service: new DepartmentService(
                this.contract<Repositories.Organization.Contract>(repositories.organizations),
                this.contract<Repositories.Department.Contract>({
                    ...repositories.departments,
                    getDescendants: jest.fn<Repositories.Department.Contract["getDescendants"]>().mockResolvedValue([]),
                    getAncestors: jest.fn<Repositories.Department.Contract["getAncestors"]>().mockResolvedValue([]),
                }),
                {
                    move: jest
                        .fn<Repositories.DepartmentClosure.Contract["move"]>()
                        .mockResolvedValue({ removedPaths: [], upsertedPaths: [] }),
                    moveSubtrees: jest
                        .fn<Repositories.DepartmentClosure.Contract["moveSubtrees"]>()
                        .mockResolvedValue({ removedPaths: [], upsertedPaths: [] }),
                    decreaseTransitiveDepth: jest
                        .fn<Repositories.DepartmentClosure.Contract["decreaseTransitiveDepth"]>()
                        .mockResolvedValue(undefined),
                    existsTransitivePath: jest
                        .fn<Repositories.DepartmentClosure.Contract["existsTransitivePath"]>()
                        .mockResolvedValue(false),
                    insertNewHierarchy: jest
                        .fn<Repositories.DepartmentClosure.Contract["insertNewHierarchy"]>()
                        .mockResolvedValue(undefined),
                },
            ),
            transaction: this.transaction(),
            services: this.services(),
            repositories,
        };
    }
}
