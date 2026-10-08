import { Migration } from "@mikro-orm/migrations";

export class Migration20261008220808_squash_initial_schema extends Migration {

    override name = "Migration20261008220808_squash_initial_schema";

    override up(): void {
        this.addSql(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
        this.addSql(`create schema if not exists "organization";`);
        this.addSql(`create schema if not exists "system";`);
        this.addSql(`create type "organization"."organization_status" as enum ('PROVISIONING', 'FAILED', 'ACTIVE', 'REVOKED');`);
        this.addSql(`create type "organization"."membership_status" as enum ('SUSPENDED', 'BLOCKED', 'JOINING', 'ACTIVE', 'LEFT');`);
        this.addSql(`create type "organization"."invite_status" as enum ('INVALIDATED', 'ACCEPTING', 'CANCELLED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'PENDING');`);
        this.addSql(`create type "organization"."department_status" as enum ('ARCHIVED', 'ACTIVE');`);
        this.addSql(`create type "organization"."project_status" as enum ('PROVISIONING', 'ARCHIVED', 'FAILED', 'ACTIVE');`);
        this.addSql(`create type "organization"."assignment_status" as enum ('REVOKED', 'ACTIVE');`);
        this.addSql(`create type "organization"."team_status" as enum ('ARCHIVED', 'ACTIVE');`);
        this.addSql(`create table "system"."audit_log" ("id" uuid not null, "action_type" varchar(64) not null, "entity_type" varchar(64) not null, "realm" uuid null, "actor" uuid null, "ip" inet null, "user_agent" text null, "input" jsonb null, "signature" text not null, "key_version" int not null, "created_at" timestamptz(3) not null, primary key ("id"));`);
        this.addSql(`create index "audit_log_realm_idx" on "system"."audit_log" ("realm");`);
        this.addSql(`create index "audit_log_actor_created_at_idx" on "system"."audit_log" ("actor", "created_at");`);
        this.addSql(`create index "audit_log_entity_type_action_type_idx" on "system"."audit_log" ("entity_type", "action_type");`);
        this.addSql(`create table "system"."change_log" ("id" uuid not null, "audit_entry_id" uuid not null, "change_type" varchar(16) not null, "entity_type" varchar(64) not null, "entity" text not null, "delta" jsonb not null, "signature" text not null, "key_version" int not null, "created_at" timestamptz(3) not null, primary key ("id"));`);
        this.addSql(`create index "change_log_audit_entry_idx" on "system"."change_log" ("audit_entry_id");`);
        this.addSql(`create index "change_log_entity_type_entity_id_idx" on "system"."change_log" ("entity_type", "entity");`);
        this.addSql(`create table "system"."inbox" ("consumer_key" text not null, "event" text not null, "partition" int null, "offset" text null, "topic" text null, "processed_at" timestamptz(3) not null, primary key ("consumer_key", "event"));`);
        this.addSql(`create index "inbox_processed_at_idx" on "system"."inbox" ("processed_at");`);
        this.addSql(`create table "organization"."organization" ("id" uuid not null, "owner_id" uuid not null, "realm_id" uuid not null, "pending_owner" uuid null, "title" text not null, "description" text not null, "status" "organization"."organization_status" not null, "revoked_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "process" uuid null, "failure" text null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`CREATE INDEX "organization_title_trgm_idx" ON "organization"."organization" USING gin ("title" gin_trgm_ops);`);
        this.addSql(`create index "organization_owner_idx" on "organization"."organization" ("owner_id", "id");`);
        this.addSql(`alter table "organization"."organization" add constraint "organization_realm_unique" unique ("realm_id");`);
        this.addSql(`create table "organization"."membership" ("id" uuid not null, "organization_id" uuid not null, "account_id" uuid not null, "status" "organization"."membership_status" not null, "suspended_at" timestamptz(3) null, "blocked_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "joined_at" timestamptz(3) null, "left_at" timestamptz(3) null, "process" uuid null, "failure" text null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`create index "membership_account_idx" on "organization"."membership" ("account_id");`);
        this.addSql(`create index "membership_status_idx" on "organization"."membership" ("status");`);
        this.addSql(`alter table "organization"."membership" add constraint "membership_organization_account_unique" unique ("organization_id", "account_id");`);
        this.addSql(`alter table "organization"."membership" add constraint "membership_id_organization_unique" unique ("id", "organization_id");`);
        this.addSql(`create table "organization"."invite" ("id" uuid not null, "status" "organization"."invite_status" not null, "invitee_id" uuid not null, "inviter_id" uuid not null, "organization_id" uuid not null, "role_id" uuid null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "expires_at" timestamptz(3) null, "process" uuid null, "failure" text null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`create index "invite_inviter_idx" on "organization"."invite" ("inviter_id");`);
        this.addSql(`create index "invite_status_expires_at_idx" on "organization"."invite" ("status", "expires_at");`);
        this.addSql(`create unique index "invite_pending_invitee_organization_unique" on "organization"."invite" ("invitee_id", "organization_id") where status in ('PENDING', 'ACCEPTING');`);
        this.addSql(`create table "organization"."department" ("id" uuid not null, "manager_position_id" uuid null, "previous_position" uuid null, "process" uuid null, "description" text not null, "name" text not null, "status" "organization"."department_status" not null, "organization_id" uuid not null, "archived_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`CREATE INDEX "department_name_trgm_idx" ON "organization"."department" USING gin ("name" gin_trgm_ops);`);
        this.addSql(`create index "department_organization_idx" on "organization"."department" ("organization_id");`);
        this.addSql(`create index "department_manager_position_idx" on "organization"."department" ("manager_position_id");`);
        this.addSql(`alter table "organization"."department" add constraint "department_id_organization_unique" unique ("id", "organization_id");`);
        this.addSql(`create table "organization"."department_closure" ("organization_id" uuid not null, "ancestor_id" uuid not null, "descendant_id" uuid not null, "depth" int not null, primary key ("organization_id", "ancestor_id", "descendant_id"));`);
        this.addSql(`create index "department_closure_ancestor_depth_idx" on "organization"."department_closure" ("ancestor_id", "depth");`);
        this.addSql(`create index "department_closure_descendant_depth_idx" on "organization"."department_closure" ("descendant_id", "depth");`);
        this.addSql(`alter table "organization"."department_closure" add constraint "department_closure_depth_check" check ((("ancestor_id" = "descendant_id" AND "depth" = 0) OR ("ancestor_id" <> "descendant_id" AND "depth" > 0)));`);
        this.addSql(`create table "system"."outbox" ("id" uuid not null, "sequence_number" bigserial, "action_type" varchar(64) not null, "destination_topic" varchar(128) not null, "payload" jsonb not null, "metadata" jsonb null, "created_at" timestamptz(3) not null, primary key ("id"));`);
        this.addSql(`create index "outbox_sequence_number_idx" on "system"."outbox" ("sequence_number");`);
        this.addSql(`create table "organization"."project" ("id" uuid not null, "organization_id" uuid not null, "manager_id" uuid null, "realm_id" uuid not null, "description" text not null, "name" text not null, "status" "organization"."project_status" not null, "archived_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "process" uuid null, "failure" text null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`CREATE INDEX "project_name_trgm_idx" ON "organization"."project" USING gin ("name" gin_trgm_ops);`);
        this.addSql(`create index "project_organization_idx" on "organization"."project" ("organization_id");`);
        this.addSql(`create index "project_manager_idx" on "organization"."project" ("manager_id", "id", "organization_id");`);
        this.addSql(`alter table "organization"."project" add constraint "project_realm_unique" unique ("realm_id");`);
        this.addSql(`alter table "organization"."project" add constraint "project_id_organization_unique" unique ("id", "organization_id");`);
        this.addSql(`create table "organization"."project_account_assignment" ("id" uuid not null, "organization_id" uuid not null, "membership_id" uuid not null, "project_id" uuid not null, "status" "organization"."assignment_status" not null, "assigned_by" uuid not null, "assigned_at" timestamptz(3) not null, "updated_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`create index "project_account_assignment_project_idx" on "organization"."project_account_assignment" ("project_id", "organization_id");`);
        this.addSql(`alter table "organization"."project_account_assignment" add constraint "project_account_assignment_membership_project_unique" unique ("membership_id", "organization_id", "project_id");`);
        this.addSql(`alter table "organization"."project_account_assignment" add constraint "project_account_assignment_id_project_unique" unique ("id", "project_id", "organization_id");`);
        this.addSql(`create table "organization"."team" ("id" uuid not null, "lead_position_id" uuid null, "previous_position" uuid null, "process" uuid null, "description" text not null, "name" text not null, "status" "organization"."team_status" not null, "organization_id" uuid not null, "department_id" uuid not null, "archived_at" timestamptz(3) null, "updated_at" timestamptz(3) null, "created_at" timestamptz(3) not null, "version" int not null default 1, primary key ("id"));`);
        this.addSql(`CREATE INDEX "team_name_trgm_idx" ON "organization"."team" USING gin ("name" gin_trgm_ops);`);
        this.addSql(`create index "team_lead_position_idx" on "organization"."team" ("lead_position_id");`);
        this.addSql(`create index "team_organization_idx" on "organization"."team" ("organization_id");`);
        this.addSql(`create index "team_department_idx" on "organization"."team" ("department_id", "organization_id");`);
        this.addSql(`alter table "organization"."team" add constraint "team_id_organization_unique" unique ("id", "organization_id");`);
        this.addSql(`alter table "organization"."organization" add constraint "organization_owner_membership_fk" foreign key ("owner_id", "id") references "organization"."membership" ("id", "organization_id") on delete no action deferrable initially deferred;`);
        this.addSql(`alter table "organization"."membership" add constraint "membership_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on delete cascade deferrable initially deferred;`);
        this.addSql(`alter table "organization"."invite" add constraint "invite_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on delete cascade;`);
        this.addSql(`alter table "organization"."department" add constraint "department_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on delete cascade;`);
        this.addSql(`alter table "organization"."department_closure" add constraint "department_closure_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on update cascade on delete cascade;`);
        this.addSql(`alter table "organization"."department_closure" add constraint "department_closure_ancestor_id_foreign" foreign key ("ancestor_id") references "organization"."department" ("id") on update cascade on delete cascade;`);
        this.addSql(`alter table "organization"."department_closure" add constraint "department_closure_descendant_id_foreign" foreign key ("descendant_id") references "organization"."department" ("id") on update cascade on delete cascade;`);
        this.addSql(`alter table "organization"."project" add constraint "project_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on delete cascade;`);
        this.addSql(`alter table "organization"."project" add constraint "project_manager_assignment_fk" foreign key ("manager_id", "id", "organization_id") references "organization"."project_account_assignment" ("id", "project_id", "organization_id") on delete set null ("manager_id");`);
        this.addSql(`alter table "organization"."project_account_assignment" add constraint "project_account_assignment_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on delete cascade;`);
        this.addSql(`alter table "organization"."project_account_assignment" add constraint "project_assignment_membership_organization_fk" foreign key ("membership_id", "organization_id") references "organization"."membership" ("id", "organization_id") on delete restrict;`);
        this.addSql(`alter table "organization"."project_account_assignment" add constraint "project_assignment_project_organization_fk" foreign key ("project_id", "organization_id") references "organization"."project" ("id", "organization_id") on delete cascade;`);
        this.addSql(`alter table "organization"."team" add constraint "team_organization_id_foreign" foreign key ("organization_id") references "organization"."organization" ("id") on delete cascade;`);
        this.addSql(`alter table "organization"."team" add constraint "team_department_organization_fk" foreign key ("department_id", "organization_id") references "organization"."department" ("id", "organization_id") on delete restrict;`);
    }

    override down(): void {
        this.addSql(`drop schema if exists "organization" cascade;`);
        this.addSql(`drop schema if exists "system" cascade;`);
    }
}
