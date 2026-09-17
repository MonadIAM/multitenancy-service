declare namespace Repositories {
    namespace DeptAccountAssignment {
        interface Contract extends Repositories.Base.Contract<
            Entities.DeptAccountAssignment,
            Repositories.Mappers.DeptAccountAssignment.Types
        > {}

        interface QueryContract extends Pick<Contract, "findUniqueOrThrow" | "findMany"> {}
    }
}
