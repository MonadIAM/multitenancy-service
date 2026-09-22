declare namespace Unit.Domain {
    namespace ServiceMockBank {
        interface Contract extends RepositoryMockBank.Contract {
            services: Services.Signature;
        }

        namespace Services {
            type Result = ServiceMocks.Contract;

            type Signature = () => Result;
        }
    }

    namespace ServiceMocks {
        type Assignment = { clean: Jest.Mock };

        type Membership = { join: Jest.Mock };

        interface Contract {
            projectAssignments: Assignment;
            departmentAssignments: Assignment;
            teamAssignments: Assignment;
            memberships: Membership;
        }
    }
}
