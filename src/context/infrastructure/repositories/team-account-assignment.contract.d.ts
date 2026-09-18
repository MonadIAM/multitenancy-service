declare namespace Repositories {
    namespace TeamAccountAssignment {
        interface Contract extends Repositories.Base.Contract<
            Entities.TeamAccountAssignment,
            Repositories.Mappers.TeamAccountAssignment.Types
        > {}

        interface QueryContract extends Pick<Contract, "findUniqueOrThrow" | "findMany"> {}
    }
}
