import { PositionReferenceType } from "~context/enums";

export class DepartmentMapper implements Commands.Mappers.Department.Contract {
    public referencePayload(
        props: Commands.Mappers.Department.ReferencePayload.Props,
    ): Commands.Mappers.Department.ReferencePayload.Result {
        const { department, actor, realm } = props;

        if (department.process) {
            return [
                {
                    actor,
                    realm,
                    input: {
                        type: PositionReferenceType.DEPARTMENT_MANAGER,
                        organization: department.organization.id,
                        position: department.managerPosition!,
                        process: department.process,
                        department: department.id,
                    },
                },
            ];
        } else {
            return [];
        }
    }

    public purgePayload(
        props: Commands.Mappers.Department.PurgePayload.Props,
    ): Commands.Mappers.Department.PurgePayload.Result {
        return props.departments.map((department) => ({
            actor: props.actor,
            realm: props.realm,
            input: {
                organization: department.organization.id,
                department: department.id,
            },
        }));
    }
}
