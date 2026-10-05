import { Migration } from '@mikro-orm/migrations';

export class Migration20261005200903_replace_department_team_assignments_with_position_refs extends Migration {

  override name = 'Migration20261005200903_replace_department_team_assignments_with_position_refs';

  override up(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."department" drop constraint "department_manager_assignment_fk";`);
    this.addSql(`alter table "multitenancy"."team" drop constraint "team_lead_assignment_fk";`);

    this.addSql(`drop table if exists "multitenancy"."dept_account_assignment" cascade;`);
    this.addSql(`drop table if exists "multitenancy"."team_account_assignment" cascade;`);

    this.addSql(`drop index "multitenancy"."department_manager_idx";`);
    this.addSql(`alter table "multitenancy"."department" drop column "manager_id";`);
    this.addSql(`alter table "multitenancy"."department" add "manager_position_id" uuid null, add "previous_position" uuid null, add "process" uuid null;`);
    this.addSql(`create index "department_manager_position_idx" on "multitenancy"."department" ("manager_position_id");`);

    this.addSql(`drop index "multitenancy"."team_lead_idx";`);
    this.addSql(`alter table "multitenancy"."team" drop column "lead_id";`);
    this.addSql(`alter table "multitenancy"."team" add "lead_position_id" uuid null, add "previous_position" uuid null, add "process" uuid null;`);
    this.addSql(`create index "team_lead_position_idx" on "multitenancy"."team" ("lead_position_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`create table "multitenancy"."dept_account_assignment" ("assigned_at" timestamptz(3) not null, "assigned_by" uuid not null, "department_id" uuid not null, "id" uuid not null, "membership_id" uuid not null, "organization_id" uuid not null, "status" "multitenancy"."assignment_status" not null, "updated_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`create index "dept_account_assignment_department_idx" on "multitenancy"."dept_account_assignment" ("department_id");`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_account_assignment_id_department_unique" unique ("id", "department_id");`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_account_assignment_membership_department_unique" unique ("membership_id", "department_id");`);

    this.addSql(`create table "multitenancy"."team_account_assignment" ("assigned_at" timestamptz(3) not null, "assigned_by" uuid not null, "id" uuid not null, "membership_id" uuid not null, "organization_id" uuid not null, "status" "multitenancy"."assignment_status" not null, "team_id" uuid not null, "updated_at" timestamptz(3) null, "version" int not null default 1, primary key ("id"));`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_account_assignment_id_team_unique" unique ("id", "team_id");`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_account_assignment_membership_team_unique" unique ("membership_id", "team_id");`);
    this.addSql(`create index "team_account_assignment_team_idx" on "multitenancy"."team_account_assignment" ("team_id");`);

    this.addSql(`drop index "multitenancy"."department_manager_position_idx";`);
    this.addSql(`alter table "multitenancy"."department" drop column "manager_position_id", drop column "previous_position", drop column "process";`);
    this.addSql(`alter table "multitenancy"."department" add "manager_id" uuid null;`);
    this.addSql(`alter table "multitenancy"."department" add constraint "department_manager_assignment_fk" foreign key ("manager_id", "id") references "multitenancy"."dept_account_assignment" ("id", "department_id") on delete set null (manager_id);`);
    this.addSql(`create index "department_manager_idx" on "multitenancy"."department" ("manager_id");`);

    this.addSql(`drop index "multitenancy"."team_lead_position_idx";`);
    this.addSql(`alter table "multitenancy"."team" drop column "lead_position_id", drop column "previous_position", drop column "process";`);
    this.addSql(`alter table "multitenancy"."team" add "lead_id" uuid null;`);
    this.addSql(`alter table "multitenancy"."team" add constraint "team_lead_assignment_fk" foreign key ("lead_id", "id") references "multitenancy"."team_account_assignment" ("id", "team_id") on delete set null (lead_id);`);
    this.addSql(`create index "team_lead_idx" on "multitenancy"."team" ("lead_id");`);

    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_assignment_department_organization_fk" foreign key ("department_id", "organization_id") references "multitenancy"."department" ("id", "organization_id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."dept_account_assignment" add constraint "dept_assignment_membership_organization_fk" foreign key ("membership_id", "organization_id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_assignment_membership_organization_fk" foreign key ("membership_id", "organization_id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict;`);
    this.addSql(`alter table "multitenancy"."team_account_assignment" add constraint "team_assignment_team_organization_fk" foreign key ("team_id", "organization_id") references "multitenancy"."team" ("id", "organization_id") on delete restrict;`);
  }

}
