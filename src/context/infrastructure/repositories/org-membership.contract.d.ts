declare namespace Repositories {
    namespace OrgMembership {
        interface Contract extends Repositories.Base.Contract<
            Entities.OrgMembership,
            Repositories.Mappers.OrgMembership.Types
        > {}

        interface QueryContract extends Pick<Contract, "findUniqueOrThrow" | "findMany"> {}
    }
}
