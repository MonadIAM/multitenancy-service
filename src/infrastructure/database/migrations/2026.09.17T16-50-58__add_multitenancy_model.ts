import { Migration } from '@mikro-orm/migrations';

export class Migration20260917165058_add_multitenancy_model extends Migration {

  override name = 'Migration20260917165058_add_multitenancy_model';

  override up(): void | Promise<void> {
    this.addSql(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    this.addSql(`create schema if not exists "multitenancy";`);
    this.addSql(`create type "multitenancy"."org_membership_status" as enum ('SUSPENDED', 'BLOCKED', 'ACTIVE', 'LEFT');`);
    this.addSql(`create type "multitenancy"."organization_status" as enum ('ACTIVE', 'REVOKED');`);
    this.addSql(`create type "multitenancy"."invite_status" as enum ('INVALIDATED', 'CANCELLED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'PENDING');`);
    this.addSql(`create type "multitenancy"."department_status" as enum ('ACTIVE', 'ARCHIVED');`);
    this.addSql(`create type "multitenancy"."assignment_status" as enum ('ACTIVE', 'REVOKED');`);
    this.addSql(`create type "multitenancy"."project_status" as enum ('ACTIVE', 'ARCHIVED');`);
    this.addSql(`create type "multitenancy"."team_status" as enum ('ACTIVE', 'ARCHIVED');`);
    this.addSql(`create table "multitenancy"."org_membership" ("id" uuid not null, "organization_id" uuid not null, "account_id" uuid not null, "status" "multitenancy"."org_membership_status" not null, "suspended_at" timestamptz(3) null, "blocked_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "joined_at" timestamptz(3) null, "left_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`create index "org_membership_account_idx" on "multitenancy"."org_membership" ("account_id");`);
    this.addSql(`create index "org_membership_status_idx" on "multitenancy"."org_membership" ("status");`);
    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_organization_account_unique" unique ("organization_id", "account_id");`);
    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_id_organization_unique" unique ("id", "organization_id");`);

    this.addSql(`create table "multitenancy"."organization" ("id" uuid not null, "owner_id" uuid not null, "realm_id" uuid not null, "title" text not null, "description" text not null, "status" "multitenancy"."organization_status" not null, "revoked_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`CREATE INDEX "organization_title_trgm_idx" ON "multitenancy"."organization" USING gin ("title" gin_trgm_ops);`);
    this.addSql(`create index "organization_owner_idx" on "multitenancy"."organization" ("owner_id");`);
    this.addSql(`alter table "multitenancy"."organization" add constraint "organization_realm_unique" unique ("realm_id");`);

    this.addSql(`create table "multitenancy"."invite" ("id" uuid not null, "status" "multitenancy"."invite_status" not null, "invitee_id" uuid not null, "inviter_id" uuid not null, "organization_id" uuid not null, "role_id" uuid not null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "expires_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`create index "invite_inviter_idx" on "multitenancy"."invite" ("inviter_id");`);
    this.addSql(`create index "invite_status_expires_at_idx" on "multitenancy"."invite" ("status", "expires_at");`);
    this.addSql(`create unique index "invite_pending_invitee_organization_unique" on "multitenancy"."invite" ("invitee_id", "organization_id") where status = 'PENDING';`);

    this.addSql(`create table "multitenancy"."department" ("id" uuid not null, "organization_id" uuid not null, "manager_id" uuid null, "description" text not null, "name" text not null, "status" "multitenancy"."department_status" not null, "archived_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`CREATE INDEX "department_name_trgm_idx" ON "multitenancy"."department" USING gin ("name" gin_trgm_ops);`);
    this.addSql(`create index "department_organization_idx" on "multitenancy"."department" ("organization_id");`);
    this.addSql(`create index "department_manager_idx" on "multitenancy"."department" ("manager_id");`);
    this.addSql(`alter table "multitenancy"."department" add constraint "department_id_organization_unique" unique ("id", "organization_id");`);

    this.addSql(`create table "multitenancy"."dept_account_assignment" ("id" uuid not null, "organization_id" uuid not null, "membership_id" uuid not null, "department_id" uuid not null, "status" "multitenancy"."assignment_status" not null, "assigned_by" uuid not null, "assigned_at" timestamptz(3) not null, "updated_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`create index "dept_account_assignment_department_idx" on "multitenancy"."dept_account_assignment" ("department_id");`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_account_assignment_membership_department_unique" unique ("membership_id", "department_id");`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_account_assignment_id_department_unique" unique ("id", "department_id");`);

    this.addSql(`create table "multitenancy"."project" ("id" uuid not null, "organization_id" uuid not null, "manager_id" uuid null, "realm_id" uuid not null, "description" text not null, "name" text not null, "status" "multitenancy"."project_status" not null, "archived_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`CREATE INDEX "project_name_trgm_idx" ON "multitenancy"."project" USING gin ("name" gin_trgm_ops);`);
    this.addSql(`create index "project_organization_idx" on "multitenancy"."project" ("organization_id");`);
    this.addSql(`create index "project_manager_idx" on "multitenancy"."project" ("manager_id");`);
    this.addSql(`alter table "multitenancy"."project" add constraint "project_realm_unique" unique ("realm_id");`);
    this.addSql(`alter table "multitenancy"."project" add constraint "project_id_organization_unique" unique ("id", "organization_id");`);

    this.addSql(`create table "multitenancy"."project_account_assignment" ("id" uuid not null, "organization_id" uuid not null, "membership_id" uuid not null, "project_id" uuid not null, "status" "multitenancy"."assignment_status" not null, "assigned_by" uuid not null, "assigned_at" timestamptz(3) not null, "updated_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`create index "project_account_assignment_project_idx" on "multitenancy"."project_account_assignment" ("project_id");`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_membership_project_unique" unique ("membership_id", "project_id");`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_id_project_unique" unique ("id", "project_id");`);

    this.addSql(`create table "multitenancy"."team" ("id" uuid not null, "organization_id" uuid not null, "department_id" uuid not null, "lead_id" uuid null, "description" text not null, "name" text not null, "status" "multitenancy"."team_status" not null, "archived_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`CREATE INDEX "team_name_trgm_idx" ON "multitenancy"."team" USING gin ("name" gin_trgm_ops);`);
    this.addSql(`create index "team_organization_idx" on "multitenancy"."team" ("organization_id");`);
    this.addSql(`create index "team_department_idx" on "multitenancy"."team" ("department_id", "organization_id");`);
    this.addSql(`create index "team_lead_idx" on "multitenancy"."team" ("lead_id");`);
    this.addSql(`alter table "multitenancy"."team" add constraint "team_id_organization_unique" unique ("id", "organization_id");`);

    this.addSql(`create table "multitenancy"."team_account_assignment" ("id" uuid not null, "organization_id" uuid not null, "membership_id" uuid not null, "team_id" uuid not null, "status" "multitenancy"."assignment_status" not null, "assigned_by" uuid not null, "assigned_at" timestamptz(3) not null, "updated_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`create index "team_account_assignment_team_idx" on "multitenancy"."team_account_assignment" ("team_id");`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_account_assignment_membership_team_unique" unique ("membership_id", "team_id");`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_account_assignment_id_team_unique" unique ("id", "team_id");`);

    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict deferrable initially deferred;`);

    this.addSql(`alter table "multitenancy"."organization" add constraint "organization_owner_membership_fk" foreign key ("owner_id", "id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict deferrable initially deferred;`);

    this.addSql(`alter table "multitenancy"."invite" add constraint "invite_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."department" add constraint "department_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."department" add constraint "department_manager_assignment_fk" foreign key ("manager_id", "id") references "multitenancy"."dept_account_assignment" ("id", "department_id") on delete set null ("manager_id");`);

    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_assignment_membership_organization_fk" foreign key ("membership_id", "organization_id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_assignment_department_organization_fk" foreign key ("department_id", "organization_id") references "multitenancy"."department" ("id", "organization_id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."project" add constraint "project_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."project" add constraint "project_manager_assignment_fk" foreign key ("manager_id", "id") references "multitenancy"."project_account_assignment" ("id", "project_id") on delete set null ("manager_id");`);

    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_assignment_membership_organization_fk" foreign key ("membership_id", "organization_id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_assignment_project_organization_fk" foreign key ("project_id", "organization_id") references "multitenancy"."project" ("id", "organization_id") on delete cascade;`);

    this.addSql(`alter table "multitenancy"."team" add constraint "team_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."team" add constraint "team_department_organization_fk" foreign key ("department_id", "organization_id") references "multitenancy"."department" ("id", "organization_id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."team" add constraint "team_lead_assignment_fk" foreign key ("lead_id", "id") references "multitenancy"."team_account_assignment" ("id", "team_id") on delete set null ("lead_id");`);

    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_assignment_membership_organization_fk" foreign key ("membership_id", "organization_id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_assignment_team_organization_fk" foreign key ("team_id", "organization_id") references "multitenancy"."team" ("id", "organization_id") on delete restrict;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`DROP EXTENSION IF EXISTS pg_trgm;`);

    this.addSql(`alter table "multitenancy"."organization" drop constraint "organization_owner_membership_fk";`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" drop constraint "dept_assignment_membership_organization_fk";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_assignment_membership_organization_fk";`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" drop constraint "team_assignment_membership_organization_fk";`);
    this.addSql(`alter table "multitenancy"."org_membership" drop constraint "org_membership_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."invite" drop constraint "invite_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."department" drop constraint "department_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" drop constraint "dept_account_assignment_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."project" drop constraint "project_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."team" drop constraint "team_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" drop constraint "team_account_assignment_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" drop constraint "dept_assignment_department_organization_fk";`);
    this.addSql(`alter table "multitenancy"."team" drop constraint "team_department_organization_fk";`);
    this.addSql(`alter table "multitenancy"."department" drop constraint "department_manager_assignment_fk";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_assignment_project_organization_fk";`);
    this.addSql(`alter table "multitenancy"."project" drop constraint "project_manager_assignment_fk";`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" drop constraint "team_assignment_team_organization_fk";`);
    this.addSql(`alter table "multitenancy"."team" drop constraint "team_lead_assignment_fk";`);

    this.addSql(`drop table if exists "multitenancy"."org_membership" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."organization" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."invite" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."department" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."dept_account_assignment" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."project" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."project_account_assignment" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."team" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."team_account_assignment" cascade;`);

    this.addSql(`drop type "multitenancy"."org_membership_status";`);
    this.addSql(`drop type "multitenancy"."organization_status";`);
    this.addSql(`drop type "multitenancy"."invite_status";`);
    this.addSql(`drop type "multitenancy"."department_status";`);
    this.addSql(`drop type "multitenancy"."assignment_status";`);
    this.addSql(`drop type "multitenancy"."project_status";`);
    this.addSql(`drop type "multitenancy"."team_status";`);
    this.addSql(`drop schema if exists "multitenancy";`);
  }

}
