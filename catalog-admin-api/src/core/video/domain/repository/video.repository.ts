import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { ISearchableRepository } from '@core/shared/domain/repository/repository.interface';
import {
  SearchParams,
  SearchParamsConstructorProps,
} from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { Video, VideoId } from '../entity/video.entity';

export type VideoFilter = {
  title?: string;
  categoryIds?: CategoryId[];
  genreIds?: GenreId[];
  castMemberIds?: CastMemberId[];
};

export class VideoSearchParams extends SearchParams<VideoFilter> {
  private constructor(props: SearchParamsConstructorProps<VideoFilter> = {}) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<VideoFilter>, 'filter'> & {
      filter?: {
        title?: string;
        categoryIds?: CategoryId[] | string[];
        genreIds?: GenreId[] | string[];
        castMemberIds?: CastMemberId[] | string[];
      };
    } = {},
  ) {
    const categoryIds = props.filter?.categoryIds?.map((c) =>
      c instanceof CategoryId ? c : new CategoryId(c),
    );
    const genreIds = props.filter?.genreIds?.map((c) =>
      c instanceof GenreId ? c : new GenreId(c),
    );
    const castMemberIds = props.filter?.castMemberIds?.map((c) =>
      c instanceof CastMemberId ? c : new CastMemberId(c),
    );

    return new VideoSearchParams({
      ...props,
      filter: {
        title: props.filter?.title,
        categoryIds,
        genreIds,
        castMemberIds,
      },
    });
  }

  get filter(): VideoFilter | null {
    return this._filter;
  }

  protected set filter(value: VideoFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value?.title && { title: `${_value?.title}` }),
      ...(_value?.categoryIds &&
        _value.categoryIds.length && {
          categoryIds: _value.categoryIds,
        }),
      ...(_value?.genreIds &&
        _value.genreIds.length && {
          genreIds: _value.genreIds,
        }),
      ...(_value?.castMemberIds &&
        _value.castMemberIds.length && {
          castMemberIds: _value.castMemberIds,
        }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class VideoSearchResult extends SearchResult<Video> {}

export interface IVideoRepository
  extends ISearchableRepository<
    Video,
    VideoId,
    VideoFilter,
    VideoSearchParams,
    VideoSearchResult
  > {}
