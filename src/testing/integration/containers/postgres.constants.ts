export const POSTGRES_IMAGE = "postgres:17-alpine";
export const DATABASE_NAME = "organization_test";
export const DATABASE_USER = "organization";
export const DATABASE_PASSWORD = "organization";

export const CONNECTION_ENV_KEYS = {
    database: "MONADIAM_TEST_POSTGRES_DATABASE",
    username: "MONADIAM_TEST_POSTGRES_USERNAME",
    password: "MONADIAM_TEST_POSTGRES_PASSWORD",
    host: "MONADIAM_TEST_POSTGRES_HOST",
    port: "MONADIAM_TEST_POSTGRES_PORT",
} as const;

export const TRUNCATED_SCHEMAS = ["system", "organization"];
export const EXCLUDED_TABLES = ["mikro_orm_migrations"];
export const IDENTIFIER_PATTERN = /^[a-z_][a-z0-9_]*$/;
