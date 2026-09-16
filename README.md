# @monadiam/multitenancy-service

Multitenancy Service manages organizations, projects, departments, teams,
organization memberships, scoped account assignments, and invitations.

----

<details>
<summary><strong>Local Deployment</strong></summary>

1. Start the [infra](https://github.com/MonadIAM/infra) repository first.

2. Start [identity-service](https://github.com/MonadIAM/identity-service) and
[access-control-service](https://github.com/MonadIAM/access-control-service)
when authenticated and authorized flows are required.

3. Create the local env file:

```sh
make env
```

4. Build and start the service:

```sh
make build
make up
```

The local service container depends on:

| Dependency          | Address inside Docker network      |
|:--------------------|:-----------------------------------|
| PostgreSQL          | `multitenancy-postgresql:5432`     |
| Redis               | `multitenancy-redis:6379`          |
| Kafka               | `kafka:29092`                      |
| Vault               | `vault:8200`                       |
| Identity JWKS       | `identity-service-app:4002`        |
| Access Control gRPC | `access-control-service-app:50051` |

Shared Docker networks are created by the infra repository:
`postgres-net`, `redis-net`, `kafka-net`, and `vault-net`.

</details>

----

<details>
<summary><strong>Local Ports</strong></summary>

| Resource   | Port                                 |
|:-----------|:-------------------------------------|
| HTTP API   | `4004`                               |
| PostgreSQL | `6004` on host, `5432` inside Docker |
| Redis      | `7004` on host, `6379` inside Docker |

</details>

----

<details>
<summary><strong>Project Commands</strong></summary>

| Makefile                          | Description                                                         |
|:----------------------------------|:--------------------------------------------------------------------|
| **Infrastructure**                |                                                                     |
| `make env`                        | Create `.env` from `.env.local.example`.                            |
| `make build`                      | Build the application image.                                        |
| `make up`                         | Start service, Vault bootstrap, and Vault Agent.                    |
| `make down`                       | Stop and remove service containers.                                 |
| `make restart`                    | Run `make down` and `make up`.                                      |
| **Development**                   |                                                                     |
| `make lint`                       | Run ESLint code checks.                                             |
| `make knip`                       | Detect unused exports, files, and dependencies.                     |
| `make intl-types`                 | Generate TypeScript types from the translation dictionaries.        |
| `make intl-check`                 | Check that all languages contain the same translation keys.         |
| **Database**                      |                                                                     |
| `make migrate`                    | Apply pending MikroORM migrations in the running service container. |
| `make migration name="..."`       | Generate a MikroORM migration in the running service container.     |
| `make empty-migration name="..."` | Generate a blank MikroORM migration.                                |
| `make seed`                       | Run the PostgreSQL seeder in the running service container.         |
| **Test**                          |                                                                     |
| `make test`                       | Run unit tests.                                                     |
| `make utest`                      | Run unit tests.                                                     |
| `make itest`                      | Run integration tests.                                              |
| `make coverage`                   | Run unit tests with coverage report.                                |

</details>

----
