import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import {
  IVideoRepository,
  VideoSearchParams,
  VideoSearchResult,
} from '@core/video/domain/repository/video.repository';
import { Op, literal } from 'sequelize';
import { VideoModelMapper } from './video-model.mapper';
import { VideoModel } from './video.model';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

export class VideoSequelizeRepository implements IVideoRepository {
  sortableFields: string[] = ['title', 'created_at'];
  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) =>
        `binary ${this.videoModel.name}.name ${sortDir}`,
    },
  };
  relationsInclude = [
    'categoryIds',
    'genreIds',
    'castMemberIds',
    'imageMedias',
    'audioVideoMedias',
  ];

  constructor(
    private videoModel: typeof VideoModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Video): Promise<void> {
    await this.videoModel.create(VideoModelMapper.toModel(entity), {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    this.uow.addAggregateRoot(entity);
  }

  async bulkInsert(entities: Video[]): Promise<void> {
    const models = entities.map((e) => VideoModelMapper.toModel(e));
    await this.videoModel.bulkCreate(models, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    entities.forEach((e) => this.uow.addAggregateRoot(e));
  }

  async findById(id: VideoId): Promise<Video | null> {
    const model = await this._get(id.id);
    return model ? VideoModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => VideoModelMapper.toEntity(m));
  }

  async findByIds(ids: VideoId[]): Promise<Video[]> {
    const models = await this.videoModel.findAll({
      where: {
        videoId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => VideoModelMapper.toEntity(m));
  }

  async existsById(
    ids: VideoId[],
  ): Promise<{ existent: VideoId[]; nonExistent: VideoId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsVideoModels = await this.videoModel.findAll({
      attributes: ['videoId'],
      where: {
        videoId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const existsVideoIds = existsVideoModels.map((m) => new VideoId(m.videoId));
    const notExistsVideoIds = ids.filter(
      (id) => !existsVideoIds.some((e) => e.equals(id)),
    );
    return {
      existent: existsVideoIds,
      nonExistent: notExistsVideoIds,
    };
  }

  async update(entity: Video): Promise<void> {
    const model = await this._get(entity.videoId.id);

    if (!model) {
      throw new NotFoundError(entity.videoId.id, this.getEntity());
    }

    await Promise.all([
      ...model.imageMedias.map((i) =>
        i.destroy({ transaction: this.uow.getTransaction() }),
      ),
      ...model.audioVideoMedias.map((i) =>
        i.destroy({
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$remove(
        'categories',
        model.categoryIds.map((c) => c.categoryId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'genres',
        model.genreIds.map((c) => c.genreId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$remove(
        'castMembers',
        model.castMemberIds.map((c) => c.castMemberId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);

    const {
      categoryIds,
      genreIds,
      castMemberIds,
      imageMedias,
      audioVideoMedias,
      ...props
    } = VideoModelMapper.toModel(entity);
    await this.videoModel.update(props, {
      where: { videoId: entity.videoId.id },
      transaction: this.uow.getTransaction(),
    });

    await Promise.all([
      ...imageMedias.map((i) =>
        model.$create('imageMedia', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      ...audioVideoMedias.map((i) =>
        model.$create('audioVideoMedia', i.toJSON(), {
          transaction: this.uow.getTransaction(),
        }),
      ),
      model.$add(
        'categories',
        categoryIds.map((c) => c.categoryId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'genres',
        genreIds.map((c) => c.genreId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
      model.$add(
        'castMembers',
        castMemberIds.map((c) => c.castMemberId),
        {
          transaction: this.uow.getTransaction(),
        },
      ),
    ]);

    this.uow.addAggregateRoot(entity);
  }

  async delete(id: VideoId): Promise<void> {
    const videoCategoryRelation =
      this.videoModel.associations.categoryIds.target;
    const videoGenreRelation = this.videoModel.associations.genreIds.target;
    const videoCastMemberRelation =
      this.videoModel.associations.castMemberIds.target;
    const imageMediaModel = this.videoModel.associations.imageMedias.target;
    const audioVideoMediaModel =
      this.videoModel.associations.audioVideoMedias.target;

    await Promise.all([
      videoCategoryRelation.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      videoGenreRelation.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      videoCastMemberRelation.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      imageMediaModel.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
      audioVideoMediaModel.destroy({
        where: { videoId: id.id },
        transaction: this.uow.getTransaction(),
      }),
    ]);
    const affectedRows = await this.videoModel.destroy({
      where: { videoId: id.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  private async _get(id: string): Promise<VideoModel | null> {
    return this.videoModel.findByPk(id, {
      include: this.relationsInclude,
      transaction: this.uow.getTransaction(),
    });
  }

  async search(props: VideoSearchParams): Promise<VideoSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;
    const videoTableName = this.videoModel.getTableName();
    const videoCategoryRelation =
      this.videoModel.associations.categoryIds.target;
    const videoCategoryTableName = videoCategoryRelation.getTableName();
    const videoGenreRelation = this.videoModel.associations.genreIds.target;
    const videoGenreTableName = videoGenreRelation.getTableName();
    const videoCastMemberRelation =
      this.videoModel.associations.castMemberIds.target;
    const videoCastMemberTableName = videoCastMemberRelation.getTableName();
    const videoAlias = this.videoModel.name;

    const wheres: any[] = [];

    if (
      props.filter &&
      (props.filter.title ||
        props.filter.categoryIds ||
        props.filter.genreIds ||
        props.filter.castMemberIds)
    ) {
      if (props.filter.title) {
        wheres.push({
          field: 'title',
          value: `%${props.filter.title}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${videoAlias}.title LIKE :title`,
        });
      }

      if (props.filter.categoryIds) {
        wheres.push({
          field: 'categoryIds',
          value: props.filter.categoryIds.map((c) => c.id),
          get condition() {
            return {
              ['$categoryIds.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCategoryTableName}.category_id IN (:categoryIds)`,
        });
      }

      if (props.filter.genreIds) {
        wheres.push({
          field: 'genreIds',
          value: props.filter.genreIds.map((c) => c.id),
          get condition() {
            return {
              ['$genreIds.genre_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoGenreTableName}.genre_id IN (:genreIds)`,
        });
      }

      if (props.filter.castMemberIds) {
        wheres.push({
          field: 'castMemberIds',
          value: props.filter.castMemberIds.map((c) => c.id),
          get condition() {
            return {
              ['$castMemberIds.cast_member_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${videoCastMemberTableName}.cast_member_id IN (:castMemberIds)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sortDir)
        : `${videoAlias}.\`created_at\` DESC`;

    const count = await this.videoModel.count({
      distinct: true,
      include: [
        props.filter?.categoryIds && 'categoryIds',
        props.filter?.genreIds && 'genreIds',
        props.filter?.castMemberIds && 'castMemberIds',
      ].filter((i) => i) as string[],
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${videoAlias}.\`video_id\`,${columnOrder} FROM ${videoTableName} as ${videoAlias}`,
      props.filter?.categoryIds
        ? `INNER JOIN ${videoCategoryTableName} ON ${videoAlias}.\`video_id\` = ${videoCategoryTableName}.\`video_id\``
        : '',
      props.filter?.genreIds
        ? `INNER JOIN ${videoGenreTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`video_id\``
        : '',
      props.filter?.castMemberIds
        ? `INNER JOIN ${videoCastMemberTableName} ON ${videoAlias}.\`video_id\` = ${videoGenreTableName}.\`video_id\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.videoModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.videoModel.findAll({
      where: {
        videoId: {
          [Op.in]: idsResult.map(
            (id: { video_id: string }) => id.video_id,
          ) as string[],
        },
      },
      include: this.relationsInclude,
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new VideoSearchResult({
      items: models.map((m) => VideoModelMapper.toEntity(m)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection | null) {
    const dialect = this.videoModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }
    return `${this.videoModel.name}.\`${sort}\` ${sortDir}`;
  }

  getEntity(): new (...args: any[]) => Video {
    return Video;
  }
}
