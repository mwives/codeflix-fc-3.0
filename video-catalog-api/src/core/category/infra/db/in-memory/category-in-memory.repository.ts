import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { InMemoryRepository } from '@core/shared/domain/repository/in-memory.repository';

export class CategoryInMemoryRepository
  extends InMemoryRepository<Category, CategoryId>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  hasOnlyOneActivateInRelated(_categoryId: CategoryId): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  hasOnlyOneNotDeletedInRelated(_categoryId: CategoryId): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
