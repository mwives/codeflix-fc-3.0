import { ListCategoriesInput } from '@core/category/application/use-cases/list-categories/list-categories.usecase';
import { CategoryFilter } from '@core/category/domain/repository/category.repository';
import { SortDirection } from '@core/shared/domain/repository/search-params';

export class SearchCategoriesDto implements ListCategoriesInput {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: string | null;
}
