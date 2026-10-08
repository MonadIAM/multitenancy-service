import { Department, DepartmentClosure } from "~context/domain/entities";

import { DepartmentFixture } from "./department.fixture";

export class DepartmentClosureFixture extends DepartmentFixture implements Fixtures.DepartmentClosure.Contract {
    public async createDetachedDepartment(organization: Entities.Organization): Promise<Entities.Department> {
        return await this.persist(new Department({ organization, name: "Detached", description: "" }));
    }

    public async tree(): Fixtures.DepartmentClosure.Tree.Result {
        const organization = await this.createOrganization();
        const a = await this.createDepartment({ organization, name: "A" });
        const b = await this.createDepartment({ organization, name: "B" });
        const c = await this.createDepartment({ organization, name: "C" });
        const d = await this.createDepartment({ organization, name: "D" });
        const x = await this.createDepartment({ organization, name: "X" });
        const chain = [a, b, c, d];
        for (let i = 0; i < chain.length; i++) {
            for (let j = i + 1; j < chain.length; j++) {
                this.entityManager.persist(
                    new DepartmentClosure({
                        organization,
                        ancestor: chain[i],
                        descendant: chain[j],
                        depth: j - i,
                    }),
                );
            }
        }
        await this.entityManager.flush();
        return { organization, a, b, c, d, x };
    }
}
