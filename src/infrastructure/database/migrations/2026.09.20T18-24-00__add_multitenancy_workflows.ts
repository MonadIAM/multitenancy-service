import { Migration } from '@mikro-orm/migrations';

export class Migration20260920182400_add_multitenancy_workflows extends Migration {

  override name = 'Migration20260920182400_add_multitenancy_workflows';

  override up(): void | Promise<void> {
    this.addSql(`alter table "multitenancy"."org_membership" add "process" uuid null, add "failure" text null;`);

    this.addSql(`alter table "multitenancy"."organization" add "pending_owner" uuid null, add "process" uuid null, add "failure" text null;`);

    this.addSql(`drop index "multitenancy"."invite_pending_invitee_organization_unique";`);
    this.addSql(`alter table "multitenancy"."invite" add "process" uuid null, add "failure" text null;`);
    this.addSql(`alter table "multitenancy"."invite" alter column "role_id" drop not null;`);
    this.addSql(`create unique index "invite_pending_invitee_organization_unique" on "multitenancy"."invite" ("invitee_id", "organization_id") where status in ('PENDING', 'ACCEPTING');`);

    this.addSql(`alter table "multitenancy"."project" add "process" uuid null, add "failure" text null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop index "multitenancy"."invite_pending_invitee_organization_unique";`);
    this.addSql(`alter table "multitenancy"."invite" drop column "process", drop column "failure";`);
    this.addSql(`alter table "multitenancy"."invite" alter column "role_id" set not null;`);
    this.addSql(`create unique index "invite_pending_invitee_organization_unique" on "multitenancy"."invite" ("invitee_id", "organization_id") where status = 'PENDING';`);

    this.addSql(`alter table "multitenancy"."org_membership" drop column "process", drop column "failure";`);

    this.addSql(`alter table "multitenancy"."organization" drop column "pending_owner", drop column "process", drop column "failure";`);

    this.addSql(`alter table "multitenancy"."project" drop column "process", drop column "failure";`);
  }

}
