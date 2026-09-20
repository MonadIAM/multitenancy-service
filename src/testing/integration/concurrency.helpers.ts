import { setTimeout } from "node:timers/promises";

export class ConcurrencyIntegrationHelpers {
    public constructor(private readonly context: Integration.Postgres.Suite.FactoryContext) {}

    public async run<First, Second>(
        props: Integration.Postgres.Concurrency.Props<First, Second>,
    ): Promise<Integration.Postgres.Concurrency.Result<First, Second>> {
        const first = this.context.writeManager.fork();
        const second = this.context.writeManager.fork();
        let outcome: Optional<Promise<PromiseSettledResult<Second>[]>>;

        try {
            await first.begin();
            await second.begin();
            const [blocker] = await first.execute<{ pid: number }[]>("select pg_backend_pid() as pid");
            const [waiter] = await second.execute<{ pid: number }[]>("select pg_backend_pid() as pid");
            const result = await props.first(first);
            await first.flush();
            outcome = Promise.allSettled([
                props.second(second).then(async (value) => {
                    await second.commit();

                    return value;
                }),
            ]);

            await this.waitForLock(blocker.pid, waiter.pid);
            await first.commit();

            return { first: result, second: (await outcome)[0] };
        } finally {
            if (first.isInTransaction()) {
                await first.rollback();
            }

            await outcome;

            if (second.isInTransaction()) {
                await second.rollback();
            }
        }
    }

    private async waitForLock(blocker: number, waiter: number, deadline = Date.now() + 5_000): Promise<void> {
        const [result] = await this.context.readManager.execute<{ blocked: boolean }[]>(
            "select ? = any(pg_blocking_pids(?)) as blocked",
            [blocker, waiter],
        );

        if (!result.blocked) {
            if (Date.now() >= deadline) {
                throw new Error("The competing transaction did not wait for the organization lock");
            } else {
                await setTimeout(10);

                await this.waitForLock(blocker, waiter, deadline);
            }
        }
    }
}
