import { Migration } from '@mikro-orm/migrations';

export class Migration20261010040322_update_organization_bootstrap extends Migration {

  override name = 'Migration20261010040322_update_organization_bootstrap';

  override up(): void | Promise<void> {
    this.addSql(`alter table "organization"."organization" drop column "failure";`);
    this.addSql(`alter table "organization"."organization" add "bootstrap_pending" jsonb not null default '[]';`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter type "organization"."organization_status" add value if not exists 'FAILED' after 'PROVISIONING';`);
    this.addSql(`alter table "organization"."organization" drop column "bootstrap_pending";`);
    this.addSql(`alter table "organization"."organization" add "failure" text null;`);
  }

}
