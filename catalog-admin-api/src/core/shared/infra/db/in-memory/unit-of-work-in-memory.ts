import { AggregateRoot } from '@core/shared/domain/entity/aggregate-root';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';

export class UnitOfWorkInMemory implements IUnitOfWork {
  private aggregateRoots: Set<AggregateRoot> = new Set<AggregateRoot>();

  async start(): Promise<void> {
    return;
  }

  async commit(): Promise<void> {
    return;
  }

  async rollback(): Promise<void> {
    return;
  }

  do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return workFn(this);
  }

  getTransaction() {
    return;
  }

  addAggregateRoot(aggregateRoot: AggregateRoot): void {
    this.aggregateRoots.add(aggregateRoot);
  }

  getAggregateRoots(): AggregateRoot[] {
    return Array.from(this.aggregateRoots);
  }
}
