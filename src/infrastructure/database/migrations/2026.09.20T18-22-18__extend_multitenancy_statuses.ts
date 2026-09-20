import { Migration } from '@mikro-orm/migrations';

export class Migration20260920182218_extend_multitenancy_statuses extends Migration {

  override name = 'Migration20260920182218_extend_multitenancy_statuses';

  override up(): void | Promise<void> {
    this.addSql(`alter type "multitenancy"."org_membership_status" add value if not exists 'JOINING' after 'BLOCKED';`);

    this.addSql(`alter type "multitenancy"."organization_status" add value if not exists 'PROVISIONING' before 'ACTIVE';`);
    this.addSql(`alter type "multitenancy"."organization_status" add value if not exists 'FAILED' after 'PROVISIONING';`);

    this.addSql(`alter type "multitenancy"."invite_status" add value if not exists 'ACCEPTING' after 'INVALIDATED';`);

    this.addSql(`alter type "multitenancy"."project_status" add value if not exists 'PROVISIONING' before 'ACTIVE';`);
    this.addSql(`alter type "multitenancy"."project_status" add value if not exists 'FAILED' after 'ARCHIVED';`);
  }

}
