declare namespace Integration.Postgres.Concurrency {
    type Props<First, Second> = {
        first: Suite.Transaction.Callback<First>;
        second: Suite.Transaction.Callback<Second>;
    };

    type Result<First, Second> = {
        first: First;
        second: PromiseSettledResult<Second>;
    };
}
