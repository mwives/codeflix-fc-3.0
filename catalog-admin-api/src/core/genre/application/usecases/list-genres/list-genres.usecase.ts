import { CategoryId } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '@core/genre/domain/repository/genre.repository';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination-output';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { GenreOutput, GenreOutputMapper } from '../common/genre.output';
import { ListGenresInput } from './list-genres.input';

export class ListGenresUseCase
  implements IUseCase<ListGenresInput, ListGenresOutput>
{
  constructor(
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const params = GenreSearchParams.create(input);
    const searchResult = await this.genreRepository.search(params);
    return this.toOutput(searchResult);
  }

  private async toOutput(
    searchResult: GenreSearchResult,
  ): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;

    const relatedCategoryIds = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => {
        return acc.concat([...item.categoryIds.values()]);
      },
      [],
    );

    const relatedCategories =
      await this.categoryRepository.findByIds(relatedCategoryIds);

    const items = _items.map((i) => {
      const genreCategories = relatedCategories.filter((c) =>
        i.categoryIds.has(c.categoryId.id),
      );
      return GenreOutputMapper.toDTO(i, genreCategories);
    });

    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;
