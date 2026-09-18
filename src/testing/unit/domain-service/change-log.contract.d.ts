import type { ChangeLogService } from "~context/domain/services/change-log.service";

declare global {
    namespace Unit.Domain.ChangeLog {
        interface Contract extends Core.Contract {
            readonly service: Service.Signature;
        }

        namespace Service {
            type Result = Core.Service.Context<ChangeLogService>;

            type Signature = () => Result;
        }
    }
}
