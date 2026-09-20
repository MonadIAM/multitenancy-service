declare namespace Services {
    namespace OrgMembership {
        interface Contract extends CommandContract {}

        interface CommandContract {
            confirmJoin: ConfirmJoin.Signature;
            rejectJoin: RejectJoin.Signature;
            clean: Clean.Signature;
            collectAccess: CollectAccess.Signature;
            suspend: Suspend.Signature;
            resume: Resume.Signature;
            block: Block.Signature;
            leave: Leave.Signature;
            join: Join.Signature;
        }

        namespace CollectAccess {
            type Props = { memberships: Entities.OrgMembership[]; transaction: ORM.EntityManager };

            type Result = Promise<{ realm: string; account: string }[]>;

            type Signature = (props: Props) => Result;
        }

        namespace Clean {
            type Props = { account: string; excludedOrganizations: string[]; transaction: ORM.EntityManager };

            type Result = Promise<{ memberships: Entities.OrgMembership[]; access: { realm: string; account: string }[] }>;

            type Signature = (props: Props) => Result;
        }

        namespace ConfirmJoin {
            type Props = Topics.Realm.MembershipJoinConfirmedMessage["payload"] & { transaction: ORM.EntityManager };

            type Result = Promise<{ access: { realm: string; account: string }[] }>;

            type Signature = (props: Props) => Result;
        }

        namespace RejectJoin {
            type Props = Topics.Realm.MembershipJoinRejectedMessage["payload"] & { transaction: ORM.EntityManager };

            type Result = Promise<void>;

            type Signature = (props: Props) => Result;
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

            type Result = Promise<{ memberships: Entities.OrgMembership[]; access: { realm: string; account: string }[] }>;

            type Signature = (props: Props) => Result;
        }

        namespace Resume {
            type Props = {
                transaction: ORM.EntityManager;
                identifiers: string[];
                realm: string;
            };

            type Result = Promise<{ memberships: Entities.OrgMembership[]; access: { realm: string; account: string }[] }>;

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
                access: { realm: string; account: string }[];
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
                access: { realm: string; account: string }[];
                memberships: Entities.OrgMembership[];
            }>;

            type Signature = (props: Props) => Result;
        }
    }
}
