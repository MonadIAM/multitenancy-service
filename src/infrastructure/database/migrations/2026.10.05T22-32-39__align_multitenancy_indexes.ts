import { Migration } from '@mikro-orm/migrations';

export class Migration20261005223239_align_multitenancy_indexes extends Migration {

  override name = 'Migration20261005223239_align_multitenancy_indexes';

  override up(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."project" drop constraint "project_manager_assignment_fk";`);

    this.addSql(`drop index "multitenancy"."organization_owner_idx";`);
    this.addSql(`create index "organization_owner_idx" on "multitenancy"."organization" ("owner_id", "id");`);

    this.addSql(`drop index "multitenancy"."project_manager_idx";`);
    this.addSql(`create index "project_manager_idx" on "multitenancy"."project" ("manager_id", "id", "organization_id");`);

    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_id_project_unique";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_membership_project_unique";`);
    this.addSql(`drop index "multitenancy"."project_account_assignment_project_idx";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_id_project_unique" unique ("id", "project_id", "organization_id");`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_membership_project_unique" unique ("membership_id", "organization_id", "project_id");`);
    this.addSql(`create index "project_account_assignment_project_idx" on "multitenancy"."project_account_assignment" ("project_id", "organization_id");`);

    this.addSql(`alter table "multitenancy"."project" add constraint "project_manager_assignment_fk" foreign key ("manager_id", "id", "organization_id") references "multitenancy"."project_account_assignment" ("id", "project_id", "organization_id") on delete set null ("manager_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."project" drop constraint "project_manager_assignment_fk";`);

    this.addSql(`drop index "multitenancy"."organization_owner_idx";`);
    this.addSql(`create index "organization_owner_idx" on "multitenancy"."organization" ("owner_id");`);

    this.addSql(`drop index "multitenancy"."project_manager_idx";`);
    this.addSql(`create index "project_manager_idx" on "multitenancy"."project" ("manager_id");`);

    this.addSql(`drop index "multitenancy"."project_account_assignment_project_idx";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_membership_project_unique";`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_id_project_unique";`);
    this.addSql(`create index "project_account_assignment_project_idx" on "multitenancy"."project_account_assignment" ("project_id");`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_membership_project_unique" unique ("membership_id", "project_id");`);
    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_id_project_unique" unique ("id", "project_id");`);

    this.addSql(`alter table "multitenancy"."project" add constraint "project_manager_assignment_fk" foreign key ("manager_id", "id") references "multitenancy"."project_account_assignment" ("id", "project_id") on delete set null ("manager_id");`);
  }

}
