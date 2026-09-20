import { Migration } from '@mikro-orm/migrations';

export class Migration20260920183626_fix_org_membership_delete_constraints extends Migration {

  override name = 'Migration20260920183626_fix_org_membership_delete_constraints';

  override up(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."org_membership" drop constraint "org_membership_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete no action deferrable initially deferred;`);

    this.addSql(`alter table "multitenancy"."organization" drop constraint "organization_owner_membership_fk";`);
    this.addSql(`alter table "multitenancy"."organization" add constraint "organization_owner_membership_fk" foreign key ("owner_id", "id") references "multitenancy"."org_membership" ("id", "organization_id") on delete no action deferrable initially deferred;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."organization" drop constraint "organization_owner_membership_fk";`);
    this.addSql(`alter table "multitenancy"."organization" add constraint "organization_owner_membership_fk" foreign key ("owner_id", "id") references "multitenancy"."org_membership" ("id", "organization_id") on delete restrict deferrable initially deferred;`);

    this.addSql(`alter table "multitenancy"."org_membership" drop constraint "org_membership_organization_id_foreign";`);
    this.addSql(`alter table "multitenancy"."org_membership" add constraint "org_membership_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on delete restrict deferrable initially deferred;`);
  }

}
