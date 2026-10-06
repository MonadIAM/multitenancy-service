import { Migration } from '@mikro-orm/migrations';

export class Migration20261005221831_cascade_organization_deletion extends Migration {

  override name = 'Migration20261005221831_cascade_organization_deletion';

  override up(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."org_membership" drop constraint "org_membership_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."invite" drop constraint "invite_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."department" drop constraint "department_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."project" drop constraint "project_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."team" drop constraint "team_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete cascade deferrable initially deferred;`);

    this.addSql(`alter table "multitenancy"."invite" add constraint "invite_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete cascade;`);

    this.addSql(`alter table "multitenancy"."department" add constraint "department_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete cascade;`);

    this.addSql(`alter table "multitenancy"."project" add constraint "project_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete cascade;`);

    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete cascade;`);

    this.addSql(`alter table "multitenancy"."team" add constraint "team_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."department" drop constraint "department_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."invite" drop constraint "invite_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."org_membership" drop constraint "org_membership_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."project" drop constraint "project_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."project_account_assignment" drop constraint "project_account_assignment_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."team" drop constraint "team_organization_id_foreign";`);

    this.addSql(`alter table "multitenancy"."department" add constraint "department_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."invite" add constraint "invite_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") deferrable initially deferred;`);

    this.addSql(`alter table "multitenancy"."project" add constraint "project_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."project_account_assignment" add constraint "project_account_assignment_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);

    this.addSql(`alter table "multitenancy"."team" add constraint "team_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict;`);
  }

}
