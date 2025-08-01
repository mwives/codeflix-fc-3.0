import {
  CastMemberType,
  InvalidCastMemberTypeError,
} from '@core/cast-member/domain/cast-member-type.vo';
import { CastMemberId } from '@core/cast-member/domain/cast-member.aggregate';
import { NestedCastMember } from '@core/cast-member/domain/nested-cast-member.entity';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { NestedCategory } from '@core/category/domain/nested-category.entity';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { NestedGenre } from '@core/genre/domain/nested-genre.entity';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { ICriteria } from '@core/shared/domain/repository/criteria.interface';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { Notification } from '@core/shared/domain/validators/notification';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { SoftDeleteElasticSearchCriteria } from '@core/shared/infra/db/elastic-search/soft-delete-elastic-search.criteria';
import { Rating } from '@core/video/domain/rating.vo';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import {
  IVideoRepository,
  VideoSearchParams,
  VideoSearchResult,
} from '@core/video/domain/video.repository';
import {
  GetGetResult,
  QueryDslQueryContainer,
  SearchTotalHits,
} from '@elastic/elasticsearch/api/types';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export const VIDEO_DOCUMENT_TYPE_NAME = 'Video';

export type VideoDocument = {
  video_title: string;
  video_title_keyword: string;
  video_description: string;
  year_launched: number;
  duration: number;
  rating: string;
  is_opened: boolean;
  is_published: boolean;
  banner_url: string | null;
  thumbnail_url: string | null;
  thumbnail_half_url: string | null;
  trailer_url: string;
  video_url: string;
  categories: {
    category_id: string;
    category_name: string;
    is_active: boolean;
    deleted_at: Date | string | null;
    is_deleted: boolean;
  }[];
  genres: {
    genre_id: string;
    genre_name: string;
    is_active: boolean;
    deleted_at: Date | string | null;
    is_deleted: boolean;
  }[];
  cast_members: {
    cast_member_id: string;
    cast_member_name: string;
    cast_member_type: number;
    deleted_at: Date | string | null;
    is_deleted: boolean;
  }[];
  created_at: Date | string;
  deleted_at: Date | string | null;
  type: typeof VIDEO_DOCUMENT_TYPE_NAME;
};

export class VideoElasticSearchMapper {
  static toEntity(id: string, document: VideoDocument): Video {
    if (document.type !== VIDEO_DOCUMENT_TYPE_NAME) {
      throw new Error('Invalid document type');
    }

    const notification = new Notification();

    const [rating, errorRating] = Rating.create(
      document.rating as any,
    ).asArray();

    if (errorRating) {
      notification.addError(errorRating.message, 'rating');
    }

    const nestedCategories = document.categories.map(
      (category) =>
        new NestedCategory({
          category_id: new CategoryId(category.category_id),
          name: category.category_name,
          is_active: category.is_active,
          deleted_at:
            category.deleted_at === null
              ? null
              : !(category.deleted_at instanceof Date)
                ? new Date(category.deleted_at)
                : category.deleted_at,
        }),
    );

    if (!nestedCategories.length) {
      notification.addError('categories should not be empty', 'categories');
    }

    const nestedGenres = document.genres.map(
      (genre) =>
        new NestedGenre({
          genre_id: new GenreId(genre.genre_id),
          name: genre.genre_name,
          is_active: genre.is_active,
          deleted_at:
            genre.deleted_at === null
              ? null
              : !(genre.deleted_at instanceof Date)
                ? new Date(genre.deleted_at)
                : genre.deleted_at,
        }),
    );

    if (!nestedGenres.length) {
      notification.addError('genres should not be empty', 'genres');
    }

    const [nestedCastMembers, errorsCastMembers] = Either.ok(
      document.cast_members,
    )
      .map((cast_members) => cast_members || [])
      .chainEach<NestedCastMember[], InvalidCastMemberTypeError[]>(
        (cast_member): Either<NestedCastMember, InvalidCastMemberTypeError> => {
          const [type, errorType] = CastMemberType.create(
            cast_member.cast_member_type,
          ).asArray();

          if (errorType) {
            return Either.fail(errorType);
          }

          return Either.ok(
            new NestedCastMember({
              cast_member_id: new CastMemberId(cast_member.cast_member_id),
              name: cast_member.cast_member_name,
              type,
              deleted_at:
                cast_member.deleted_at === null
                  ? null
                  : !(cast_member.deleted_at instanceof Date)
                    ? new Date(cast_member.deleted_at)
                    : cast_member.deleted_at,
            }),
          );
        },
      )
      .asArray();

    if (!nestedCastMembers.length) {
      notification.addError('genres should not be empty', 'genres');
    }

    if (errorsCastMembers && errorsCastMembers.length) {
      errorsCastMembers.forEach((error) => {
        notification.addError(error.message, 'cast_members');
      });
    }

    const video = new Video({
      video_id: new VideoId(id),
      title: document.video_title,
      description: document.video_description,
      year_launched: document.year_launched,
      duration: document.duration,
      rating,
      is_opened: document.is_opened,
      is_published: document.is_published,
      banner_url: document.banner_url,
      thumbnail_url: document.thumbnail_url,
      thumbnail_half_url: document.thumbnail_half_url,
      trailer_url: document.trailer_url,
      video_url: document.video_url,

      categories: new Map(
        nestedCategories.map((category) => [category.category_id.id, category]),
      ),
      genres: new Map(nestedGenres.map((genre) => [genre.genre_id.id, genre])),
      cast_members: new Map(
        nestedCastMembers.map((cast_member) => [
          cast_member.cast_member_id.id,
          cast_member,
        ]),
      ),
      created_at: !(document.created_at instanceof Date)
        ? new Date(document.created_at)
        : document.created_at,
      deleted_at:
        document.deleted_at === null
          ? null
          : !(document.deleted_at instanceof Date)
            ? new Date(document.deleted_at!)
            : document.deleted_at,
    });

    video.validate();

    notification.copyErrors(video.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return video;
  }

  static toDocument(entity: Video): VideoDocument {
    return {
      video_title: entity.title,
      video_title_keyword: entity.title,
      video_description: entity.description,
      year_launched: entity.year_launched,
      duration: entity.duration,
      rating: entity.rating.value,
      is_opened: entity.is_opened,
      is_published: entity.is_published,
      banner_url: entity.banner_url,
      thumbnail_url: entity.thumbnail_url,
      thumbnail_half_url: entity.thumbnail_half_url,
      trailer_url: entity.trailer_url,
      video_url: entity.video_url,
      categories: Array.from(entity.categories.values()).map((category) => ({
        category_id: category.category_id.id,
        category_name: category.name,
        is_active: category.is_active,
        deleted_at: category.deleted_at,
        is_deleted: category.deleted_at !== null,
      })),
      genres: Array.from(entity.genres.values()).map((genre) => ({
        genre_id: genre.genre_id.id,
        genre_name: genre.name,
        is_active: genre.is_active,
        deleted_at: genre.deleted_at,
        is_deleted: genre.deleted_at !== null,
      })),
      cast_members: Array.from(entity.cast_members.values()).map(
        (cast_member) => ({
          cast_member_id: cast_member.cast_member_id.id,
          cast_member_name: cast_member.name,
          cast_member_type: cast_member.type.type,
          deleted_at: cast_member.deleted_at,
          is_deleted: cast_member.deleted_at !== null,
        }),
      ),
      created_at: entity.created_at,
      deleted_at: entity.deleted_at,
      type: VIDEO_DOCUMENT_TYPE_NAME,
    };
  }
}

export class VideoElasticSearchRepository implements IVideoRepository {
  constructor(
    private readonly esClient: ElasticsearchService,
    private index: string,
  ) {}

  sortableFields: string[] = ['title', 'created_at'];
  sortableFieldsMap: { [key: string]: string } = {
    title: 'video_title_keyword',
    created_at: 'created_at',
  };
  scopes: Map<string, ICriteria> = new Map();

  async insert(entity: Video): Promise<void> {
    await this.esClient.index({
      index: this.index,
      id: entity.video_id.id,
      body: VideoElasticSearchMapper.toDocument(entity),
      refresh: true,
    });
  }

  async bulkInsert(entities: Video[]): Promise<void> {
    await this.esClient.bulk({
      index: this.index,
      body: entities.flatMap((entity) => [
        { index: { _id: entity.video_id.id } },
        VideoElasticSearchMapper.toDocument(entity),
      ]),
      refresh: true,
    });
  }

  async findById(id: VideoId): Promise<Video | null> {
    const query = {
      bool: {
        must: [
          {
            match: {
              _id: id.id,
            },
          },
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };
    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: scopedQuery,
      },
    });

    const docs = result.body.hits.hits as GetGetResult<VideoDocument>[];

    if (docs.length === 0) {
      return null;
    }

    const document = docs[0]._source!;

    if (!document) {
      return null;
    }

    return VideoElasticSearchMapper.toEntity(id.id, document);
  }

  async findAll(): Promise<Video[]> {
    const query = {
      bool: {
        must: [
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };
    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: scopedQuery,
      },
    });
    return result.body.hits.hits.map((hit) =>
      VideoElasticSearchMapper.toEntity(hit._id, hit._source!),
    );
  }

  async findByIds(
    ids: VideoId[],
  ): Promise<{ exists: Video[]; not_exists: VideoId[] }> {
    const query = {
      bool: {
        must: [
          {
            ids: {
              values: ids.map((id) => id.id),
            },
          },
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };

    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: scopedQuery,
      },
    });

    const docs = result.body.hits.hits as GetGetResult<VideoDocument>[];
    return {
      exists: docs.map((doc) =>
        VideoElasticSearchMapper.toEntity(doc._id as string, doc._source!),
      ),
      not_exists: ids.filter((id) => !docs.some((doc) => doc._id === id.id)),
    };
  }

  async findOneBy(filter: { video_id?: VideoId }): Promise<Video | null> {
    const query: QueryDslQueryContainer = {
      bool: {
        must: [
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };

    if (filter.video_id) {
      //@ts-expect-error - must is an array
      query.bool.must.push({
        match: {
          _id: filter.video_id.id,
        },
      });
    }

    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: scopedQuery,
      },
    });

    const docs = result.body.hits.hits as GetGetResult<VideoDocument>[];

    if (!docs.length) {
      return null;
    }

    return VideoElasticSearchMapper.toEntity(
      docs[0]._id as string,
      docs[0]._source!,
    );
  }

  async findBy(
    filter: {
      video_id?: VideoId;
      is_active?: boolean;
    },
    order?: {
      field: 'name' | 'created_at';
      direction: SortDirection;
    },
  ): Promise<Video[]> {
    const query: QueryDslQueryContainer = {
      bool: {
        must: [
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };

    if (filter.video_id) {
      //@ts-expect-error - must is an array
      query.bool.must.push({
        match: {
          _id: filter.video_id.id,
        },
      });
    }

    if (filter.is_active !== undefined) {
      //@ts-expect-error - must is an array
      query.bool.must.push({
        match: {
          is_active: filter.is_active,
        },
      });
    }
    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: scopedQuery,
        sort:
          order &&
          Object.prototype.hasOwnProperty.call(
            this.sortableFieldsMap,
            order.field,
          )
            ? ([
                { [this.sortableFieldsMap[order.field]]: order.direction },
              ] as any)
            : undefined,
      },
    });

    return result.body.hits.hits.map((hit) =>
      VideoElasticSearchMapper.toEntity(hit._id, hit._source!),
    );
  }

  async existsById(
    ids: VideoId[],
  ): Promise<{ exists: VideoId[]; not_exists: VideoId[] }> {
    const query = {
      bool: {
        must: [
          {
            ids: {
              values: ids.map((id) => id.id),
            },
          },
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };
    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: scopedQuery,
      },
      _source: false as any,
    });

    const docs = result.body.hits.hits as GetGetResult<VideoDocument>[];
    const existsVideoIds = docs.map((m) => new VideoId(m._id as string));
    const notExistsVideoIds = ids.filter(
      (id) => !existsVideoIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsVideoIds,
      not_exists: notExistsVideoIds,
    };
  }

  async update(entity: Video): Promise<void> {
    const query = {
      bool: {
        must: [
          {
            match: {
              _id: entity.video_id.id,
            },
          },
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };
    const scopedQuery = this.applyScopes(query);
    const response = await this.esClient.updateByQuery({
      index: this.index,
      body: {
        query: scopedQuery,
        script: {
          source: `
          ctx._source.video_title = params.video_title;
          ctx._source.video_title_keyword = params.video_title_keyword;
          ctx._source.video_description = params.video_description;
          ctx._source.year_launched = params.year_launched;
          ctx._source.duration = params.duration;
          ctx._source.rating = params.rating;
          ctx._source.is_opened = params.is_opened;
          ctx._source.is_published = params.is_published;
          ctx._source.banner_url = params.banner_url;
          ctx._source.thumbnail_url = params.thumbnail_url;
          ctx._source.thumbnail_half_url = params.thumbnail_half_url;
          ctx._source.trailer_url = params.trailer_url;
          ctx._source.video_url = params.video_url;
          ctx._source.categories = params.categories;
          ctx._source.genres = params.genres;
          ctx._source.cast_members = params.cast_members;
          ctx._source.created_at = params.created_at;
          ctx._source.deleted_at = params.deleted_at;
        `,
          params: {
            ...VideoElasticSearchMapper.toDocument(entity),
          },
        },
      },
      refresh: true,
    });

    if (response.body.updated == 0) {
      throw new NotFoundError(entity.video_id.id, this.getEntity());
    }
  }

  async delete(id: VideoId): Promise<void> {
    const query = {
      bool: {
        must: [
          {
            match: {
              _id: id.id,
            },
          },
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };

    const scopedQuery = this.applyScopes(query);
    const response = await this.esClient.deleteByQuery({
      index: this.index,
      body: {
        query: scopedQuery,
      },
      refresh: true,
    });
    if (response.body.deleted == 0) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  async search(props: VideoSearchParams): Promise<VideoSearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const query: QueryDslQueryContainer = {
      bool: {
        must: [
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };

    if (props.filter) {
      if (props.filter.title_or_description) {
        //@ts-expect-error - must is an array
        query.bool.must.push({
          multi_match: {
            query: props.filter.title_or_description,
            type: 'most_fields',
            fields: ['video_title', 'video_description'],
            fuzziness: 'AUTO',
          },
        });
      }

      if (props.filter.categories_id) {
        //@ts-expect-error - must is an array
        query.bool.must.push({
          nested: {
            path: 'categories',
            query: {
              terms: {
                'categories.category_id': props.filter.categories_id.map(
                  (c) => c.id,
                ),
              },
            },
          },
        });
      }

      if (props.filter.genres_id) {
        //@ts-expect-error - must is an array
        query.bool.must.push({
          nested: {
            path: 'genres',
            query: {
              terms: {
                'genres.genre_id': props.filter.genres_id.map((g) => g.id),
              },
            },
          },
        });
      }

      if (props.filter.cast_members_id) {
        //@ts-expect-error - must is an array
        query.bool.must.push({
          nested: {
            path: 'cast_members',
            query: {
              terms: {
                'cast_members.cast_member_id': props.filter.cast_members_id.map(
                  (c) => c.id,
                ),
              },
            },
          },
        });
      }
      if (props.filter.is_published !== undefined) {
        //@ts-expect-error - must is an array
        query.bool.must.push({
          match: {
            is_published: props.filter.is_published,
          },
        });
      }
    }

    const scopedQuery = this.applyScopes(query);
    const result = await this.esClient.search({
      index: this.index,
      from: offset,
      size: limit,
      body: {
        query: scopedQuery,
        sort:
          props.sort &&
          Object.prototype.hasOwnProperty.call(
            this.sortableFieldsMap,
            props.sort,
          )
            ? [{ [this.sortableFieldsMap[props.sort]]: props.sort_dir! }]
            : [{ created_at: 'desc' }],
      },
    });
    const docs = result.body.hits.hits as GetGetResult<VideoDocument>[];
    const entities = docs.map((doc) =>
      VideoElasticSearchMapper.toEntity(doc._id as string, doc._source!),
    );
    const total = result.body.hits.total as SearchTotalHits;
    return new VideoSearchResult({
      total: total.value,
      current_page: props.page,
      per_page: props.per_page,
      items: entities,
    });
  }

  async searchByCriteria(
    criterias: ICriteria[],
    searchParams: VideoSearchParams,
  ): Promise<VideoSearchResult> {
    const offset = (searchParams.page - 1) * searchParams.per_page;
    const limit = searchParams.per_page;

    let query: QueryDslQueryContainer = {
      bool: {
        must: [
          {
            match: {
              type: VIDEO_DOCUMENT_TYPE_NAME,
            },
          },
        ],
      },
    };

    for (const criteria of criterias) {
      query = criteria.applyCriteria(query);
    }

    const result = await this.esClient.search({
      index: this.index,
      body: {
        query,
        from: offset,
        size: limit,
        sort:
          searchParams.sort &&
          Object.prototype.hasOwnProperty.call(
            this.sortableFieldsMap,
            searchParams.sort,
          )
            ? ([
                {
                  [this.sortableFieldsMap[searchParams.sort]]:
                    searchParams.sort_dir!,
                },
              ] as any)
            : ([{ created_at: 'desc' }] as any),
      },
    });
    const docs = result.body.hits.hits as GetGetResult<VideoDocument>[];
    const entities = docs.map((doc) =>
      VideoElasticSearchMapper.toEntity(doc._id as string, doc._source!),
    );
    const total = result.body.hits.total as SearchTotalHits;
    return new VideoSearchResult({
      total: total.value,
      current_page: searchParams.page,
      per_page: searchParams.per_page,
      items: entities,
    });
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }

  ignoreSoftDeleted(): this {
    this.scopes.set(
      SoftDeleteElasticSearchCriteria.name,
      new SoftDeleteElasticSearchCriteria(),
    );
    return this;
  }

  clearScopes(): this {
    this.scopes.clear();
    return this;
  }

  private applyScopes(query: QueryDslQueryContainer): QueryDslQueryContainer {
    return Array.from(this.scopes.values()).reduce(
      (acc, criteria) => criteria.applyCriteria(acc),
      query,
    );
  }
}
