import { Inject, Injectable, Scope } from "@nestjs/common";

import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { DEPARTMENT_SERVICE } from "~context/domain/services";
import { ActionType, EntityType } from "~context/enums";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentCommands implements Commands.Department.Contract {
    private readonly dictionaryPath = "commands.department";
    private readonly resource = "Department";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(DEPARTMENT_SERVICE)
        private readonly departmentService: Services.Department.CommandContract,
    ) {}

    public async create(props: Commands.Department.Create.Props): Commands.Department.Create.Result {
        const { input, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.CREATE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.departmentService.create({ input, transaction, realm });
            },
        });

        return { message: `${this.dictionaryPath}.CREATED` };
    }

    public async update(props: Commands.Department.Update.Props): Commands.Department.Update.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.departmentService.update({ patch: input.patch, transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.UPDATED` };
    }

    public async assignManager(props: Commands.Department.AssignManager.Props): Commands.Department.AssignManager.Result {
        const { input, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.departmentService.assignManager({
                    assignment: input.assignment,
                    transaction,
                    realm,
                    id,
                });
            },
        });

        return { message: `${this.dictionaryPath}.MANAGER_ASSIGNED` };
    }

    public async unassignManager(
        props: Commands.Department.UnassignManager.Props,
    ): Commands.Department.UnassignManager.Result {
        const { realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.UPDATE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.departmentService.unassignManager({ transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.MANAGER_UNASSIGNED` };
    }

    public async archive(props: Commands.Department.Archive.Props): Commands.Department.Archive.Result {
        const { input, realm } = props;

        const departments = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.ARCHIVE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.departmentService.archive({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (departments.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_ARCHIVED_COUNT`, params: { count: departments.length } };
        } else {
            return { message: `${this.dictionaryPath}.ARCHIVED` };
        }
    }

    public async restore(props: Commands.Department.Restore.Props): Commands.Department.Restore.Result {
        const { input, realm } = props;

        const departments = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.RESTORE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.departmentService.restore({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (departments.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_RESTORED_COUNT`, params: { count: departments.length } };
        } else {
            return { message: `${this.dictionaryPath}.RESTORED` };
        }
    }

    public async purge(props: Commands.Department.Purge.Props): Commands.Department.Purge.Result {
        const { input, realm } = props;

        const departments = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                actionType: ActionType.DELETE,
                entityType: EntityType.DEPARTMENT,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                return await this.departmentService.purge({ identifiers: input.identifiers, transaction, realm });
            },
        });

        if (departments.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: departments.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
