export class ProjectMapper implements Commands.Mappers.Project.Contract {
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
        props: Commands.Mappers.Project.Bootstrap,
    ): Topics.Realm.BootstrapProjectRequestedMessage["payload"] {
        const { project, actor } = props;

        return {
            actor,
            realm: project.realm,
            input: {
                process: project.process!,
                resource: project.id,
                owner: project.organization.owner.account,
                organizationRealm: project.organization.realm,
                name: project.name,
                description: project.description,
            },
        };
    }

    public lifecyclePayload(props: Commands.Mappers.Project.Lifecycle): Topics.Realm.SystemLifecycleMessage["payload"][] {
        return props.projects.map((project) => ({
            actor: props.actor,
            realm: project.realm,
        }));
    }
}
