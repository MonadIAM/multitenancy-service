import { Migration } from '@mikro-orm/migrations';

export class Migration20261008210807_add_department_hierarchy extends Migration {

  override name = 'Migration20261008210807_add_department_hierarchy';

  override up(): void | Promise<void> {
    this.addSql(`create table "multitenancy"."department_closure" ("organization_id" uuid not null, "ancestor_id" uuid not null, "descendant_id" uuid not null, "depth" int not null, primary key ("organization_id", "ancestor_id", "descendant_id"));`);
    this.addSql(`create index "department_closure_ancestor_depth_idx" on "multitenancy"."department_closure" ("ancestor_id", "depth");`);
    this.addSql(`create index "department_closure_descendant_depth_idx" on "multitenancy"."department_closure" ("descendant_id", "depth");`);

    this.addSql(`alter table "multitenancy"."department_closure" add constraint "department_closure_organization_id_foreign" foreign key ("organization_id") references "multitenancy"."organization" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "multitenancy"."department_closure" add constraint "department_closure_ancestor_id_foreign" foreign key ("ancestor_id") references "multitenancy"."department" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "multitenancy"."department_closure" add constraint "department_closure_descendant_id_foreign" foreign key ("descendant_id") references "multitenancy"."department" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "multitenancy"."department_closure" add constraint "department_closure_depth_check" check ((("ancestor_id" = "descendant_id" AND "depth" = 0) OR ("ancestor_id" <> "descendant_id" AND "depth" > 0)));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "multitenancy"."department_closure" cascade;`);
  }

}
