export class OrganizationMapper implements Commands.Mappers.Organization.Contract {
    public compensationPayload(props: {
        realms: { realm: string }[];
        actor: string;
    }): Topics.Realm.SystemLifecycleMessage["payload"][] {
        return props.realms.map(({ realm }) => ({
            actor: props.actor,
            realm,
        }));
    }

    public bootstrapPayload(
        props: Commands.Mappers.Organization.Bootstrap,
    ): Topics.Realm.BootstrapOrganizationRequestedMessage["payload"] {
        const { organization, membership } = props;

        return {
            actor: membership.account,
            realm: organization.realm,
            input: {
                process: organization.process!,
                resource: organization.id,
                owner: membership.account,
                name: organization.title,
                description: organization.description,
            },
        };
    }

    public transferPayload(
        props: Commands.Mappers.Organization.Transfer,
    ): Topics.Realm.TransferOwnershipRequestedMessage["payload"] {
        return {
            actor: props.actor,
            realm: props.organization.realm,
            input: {
                process: props.organization.process!,
                organization: props.organization.id,
                previousOwner: props.previousOwner,
                owner: props.owner,
            },
        };
    }

    public lifecyclePayload(
        props: Commands.Mappers.Organization.Lifecycle,
    ): Topics.Realm.SystemLifecycleMessage["payload"][] {
        return props.realms.map(({ realm }) => ({
            actor: props.actor,
            realm,
        }));
    }
}
