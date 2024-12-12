import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory.repository';

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category, Uuid>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(
    items: Category[],
    filter: string,
  ): Promise<Category[]> {
    if (!filter) {
      return items;
    }

    return items.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }

  protected applySort(
    items: Category[],
    sort: string | null,
    sortDir: SortDirection | null,
  ) {
    return sort
      ? super.applySort(items, sort, sortDir)
      : super.applySort(items, 'createdAt', 'desc');
  }
}
