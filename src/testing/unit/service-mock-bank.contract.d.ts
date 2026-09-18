declare namespace Unit {
    namespace Domain {
        namespace ServiceMockBank {
            interface Contract extends RepositoryMockBank.Contract {
                readonly services: Services.Signature;
            }

            namespace Services {
                type Result = ServiceMocks.Contract;

                type Signature = () => Result;
            }
        }

        namespace ServiceMocks {
            type Assignment = { clean: Mock };

            type Membership = { join: Mock };

            interface Contract {
                readonly projectAssignments: Assignment;
                readonly departmentAssignments: Assignment;
                readonly teamAssignments: Assignment;
                readonly memberships: Membership;
            }
        }
    }
}
