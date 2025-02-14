import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { InMemoryRepository } from '@core/shared/domain/repository/in-memory.repository';

export class CategoryInMemoryRepository
  extends InMemoryRepository<Category, CategoryId>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'created_at'];
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
