import { Inject, Injectable, Scope } from "@nestjs/common";

import { ActionType, EntityType, KafkaTopic, PositionTopicAction } from "~context/enums";
import { TRANSACTIONAL_SERVICE } from "~common/transaction-manager";
import { DEPARTMENT_SERVICE } from "~context/domain/services";

import { DepartmentMapper } from "../mappers/department.mapper";

@Injectable({ scope: Scope.DEFAULT })
export class DepartmentCommands implements Commands.Department.Contract {
    private readonly mapper: Commands.Mappers.Department.Contract;
    private readonly dictionaryPath = "commands.department";
    private readonly resource = "Department";

    public constructor(
        @Inject(TRANSACTIONAL_SERVICE)
        private readonly transactionalService: TransactionManager.Service.PublicContract,
        @Inject(DEPARTMENT_SERVICE)
        private readonly departmentService: Services.Department.CommandContract,
    ) {
        this.mapper = new DepartmentMapper();
    }

    public async create(props: Commands.Department.Create.Props): Commands.Department.Create.Result {
        const { input, realm } = props;

        await this.transactionalService.run({
            resource: this.resource,
            audit: {
                entityType: EntityType.DEPARTMENT,
                actionType: ActionType.CREATE,
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
                entityType: EntityType.DEPARTMENT,
                actionType: ActionType.UPDATE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                await this.departmentService.update({ patch: input.patch, transaction, realm, id });
            },
        });

        return { message: `${this.dictionaryPath}.UPDATED` };
    }

    public async changeManager(props: Commands.Department.ChangeManager.Props): Commands.Department.ChangeManager.Result {
        const { input, actor, realm, id } = props;

        await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.referencePayload,
                actionType: PositionTopicAction.REFERENCE_REQUESTED,
                destinationTopic: KafkaTopic.POSITION,
            },
            audit: {
                entityType: EntityType.DEPARTMENT,
                actionType: ActionType.UPDATE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const department = await this.departmentService.changeManager({
                    position: input.position,
                    transaction,
                    realm,
                    id,
                });
                return { department, actor, realm };
            },
        });

        if (input.position) {
            return { message: `${this.dictionaryPath}.MANAGER_ASSIGNED` };
        } else {
            return { message: `${this.dictionaryPath}.MANAGER_UNASSIGNED` };
        }
    }

    public async archive(props: Commands.Department.Archive.Props): Commands.Department.Archive.Result {
        const { input, realm } = props;

        const departments = await this.transactionalService.run({
            resource: this.resource,
            audit: {
                entityType: EntityType.DEPARTMENT,
                actionType: ActionType.ARCHIVE,
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
                entityType: EntityType.DEPARTMENT,
                actionType: ActionType.RESTORE,
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
        const { input, actor, realm } = props;

        const { departments } = await this.transactionalService.run({
            resource: this.resource,
            outbox: {
                payloadMapper: this.mapper.purgePayload,
                actionType: PositionTopicAction.DEPARTMENT_PURGED,
                destinationTopic: KafkaTopic.POSITION,
            },
            audit: {
                entityType: EntityType.DEPARTMENT,
                actionType: ActionType.DELETE,
                ...props,
            },
            changeLog: true,
            execute: async (transaction) => {
                const departments = await this.departmentService.purge({
                    identifiers: input.identifiers,
                    transaction,
                    realm,
                });
                return { departments, actor, realm };
            },
        });

        if (departments.length > 1) {
            return { message: `${this.dictionaryPath}.BULK_PURGED_COUNT`, params: { count: departments.length } };
        } else {
            return { message: `${this.dictionaryPath}.PURGED` };
        }
    }
}
