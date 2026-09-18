declare namespace Services {
    namespace OrgMembership {
        interface Contract extends CommandContract {}

        interface CommandContract {
            suspend: Suspend.Signature;
            resume: Resume.Signature;
            block: Block.Signature;
            leave: Leave.Signature;
            join: Join.Signature;
        }

        namespace Join {
            type Props = {
                transaction: ORM.EntityManager;
                realm: string;
                input: {
                    organization: string;
                    account: string;
                };
            };

            type Result = Promise<Entities.OrgMembership>;

            type Signature = (props: Props) => Result;
        }

        namespace Suspend {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.OrgMembership[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Resume {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<Entities.OrgMembership[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Leave {
            type Props = {
                transaction: ORM.EntityManager;
                account: string;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<{
                assignments: {
                    department: Entities.DeptAccountAssignment[];
                    project: Entities.ProjectAccountAssignment[];
                    team: Entities.TeamAccountAssignment[];
                };
                memberships: Entities.OrgMembership[];
            }>;

            type Signature = (props: Props) => Result;
        }

        namespace Block {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<{
                assignments: {
                    department: Entities.DeptAccountAssignment[];
                    project: Entities.ProjectAccountAssignment[];
                    team: Entities.TeamAccountAssignment[];
                };
                memberships: Entities.OrgMembership[];
            }>;

            type Signature = (props: Props) => Result;
        }
    }
}
