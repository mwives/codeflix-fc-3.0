import { ISearchableRepository } from '../../../shared/domain/repository/repository.interface';
import { SearchParams } from '../../../shared/domain/repository/search-params';
import { SearchResult } from '../../../shared/domain/repository/search-result';
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo';
import { Category } from '../entity/category.entity';

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export type ICategoryRepository = ISearchableRepository<
  Category,
  Uuid,
  CategoryFilter,
  CategorySearchParams,
  CategorySearchResult
>;
