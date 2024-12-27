import { CategoryId } from '@core/category/domain/entity/category.entity';
import { ISearchableRepository } from '@core/shared/domain/repository/repository.interface';
import {
  SearchParams,
  SearchParamsConstructorProps,
} from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { Genre, GenreId } from '../entity/genre.entity';

export type GenreFilter = {
  name?: string;
  categoryIds?: CategoryId[];
};

export class GenreSearchParams extends SearchParams<GenreFilter> {
  private constructor(props: SearchParamsConstructorProps<GenreFilter> = {}) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<GenreFilter>, 'filter'> & {
      filter?: {
        name?: string;
        categoryIds?: CategoryId[] | string[];
      };
    } = {},
  ) {
    const categoryIds = props.filter?.categoryIds?.map((c) => {
      return c instanceof CategoryId ? c : new CategoryId(c);
    });

    return new GenreSearchParams({
      ...props,
      filter: {
        name: props.filter?.name,
        categoryIds,
      },
    });
  }

  get filter(): GenreFilter | null {
    return this._filter;
  }

  protected set filter(value: GenreFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value?.name && { name: `${_value.name}` }),
      ...(_value?.categoryIds &&
        _value?.categoryIds.length && {
          categoryIds: _value.categoryIds,
        }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class GenreSearchResult extends SearchResult<Genre> {}

export interface IGenreRepository
  extends ISearchableRepository<
    Genre,
    GenreId,
    GenreFilter,
    GenreSearchParams,
    GenreSearchResult
  > {}
