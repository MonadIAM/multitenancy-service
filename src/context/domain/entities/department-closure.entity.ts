export class DepartmentClosure implements Entities.DepartmentClosure.Contract {
    public depth: number;

    public descendant: Entities.Department;
    public ancestor: Entities.Department;
    public organization: Entities.Organization;

    public constructor(props: Entities.DepartmentClosure.ConstructorProps) {
        this.depth = props.depth;

        this.descendant = props.descendant;
        this.ancestor = props.ancestor;
        this.organization = props.organization;
    }
}
