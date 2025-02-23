import { ICategoryRepository } from '@core/category/domain/category.repository';
import { SearchInput } from '@core/shared/application/search-input';
import { IUseCase } from '@core/shared/application/use-case-interface';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../common/category-output';

export class ListAllCategoriesUseCase
  implements IUseCase<ListCategoriesInput, ListCategoriesOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(): Promise<ListCategoriesOutput> {
    const categories = await this.categoryRepo.findBy(
      {
        is_active: true,
      },
      { field: 'name', direction: 'asc' },
    );
    return categories.map(CategoryOutputMapper.toOutput);
  }
}

export type ListCategoriesInput = SearchInput;

export type ListCategoriesOutput = CategoryOutput[];
