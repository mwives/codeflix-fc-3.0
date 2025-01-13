import { ApplicationService } from '@core/shared/application/application.service';
import { DomainEventMediator } from '@core/shared/domain/events/domain-event-mediator';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { Global, Module, Scope } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: ApplicationService,
      scope: Scope.REQUEST,
      inject: ['UnitOfWork', DomainEventMediator],
      useFactory(uow: IUnitOfWork, domainEventMediator: DomainEventMediator) {
        return new ApplicationService(uow, domainEventMediator);
      },
    },
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
