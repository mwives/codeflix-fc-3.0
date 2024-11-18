import {
  PaginationOutput,
  PaginationOutputMapper,
} from '../../../../shared/application/pagination-output'
import { IUseCase } from '../../../../shared/application/use-case.interface'
import { SortDirection } from '../../../../shared/domain/repository/search-params'
import {
  CategoryFilter,
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/repository/category.repository'
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../@shared/category-output'

export class ListCategoriesUseCase
  implements IUseCase<ListCategoriesInput, ListCategoriesOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const params = new CategorySearchParams(input)
    const searchResult = await this.categoryRepo.search(params)
    return this.toOutput(searchResult)
  }

  private toOutput(searchResult: CategorySearchResult): ListCategoriesOutput {
    const { items: _items } = searchResult
    const items = _items.map((i) => {
      return CategoryOutputMapper.toDTO(i)
    })
    return PaginationOutputMapper.toOutput(items, searchResult)
  }
}

export type ListCategoriesInput = {
  page?: number
  perPage?: number
  sort?: string | null
  sortDir?: SortDirection | null
  filter?: CategoryFilter | null
}

export type ListCategoriesOutput = PaginationOutput<CategoryOutput>
