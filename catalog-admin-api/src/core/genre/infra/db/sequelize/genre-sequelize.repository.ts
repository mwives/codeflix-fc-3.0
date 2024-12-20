import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import {
  GenreSearchParams,
  GenreSearchResult,
  IGenreRepository,
} from '@core/genre/domain/repository/genre.repository';
import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Op, literal } from 'sequelize';
import { GenreModelMapper } from './genre-model-mapper';
import { GenreModel } from './genre.model';

export class GenreSequelizeRepository implements IGenreRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) =>
        `binary ${this.genreModel.name}.name ${sortDir}`,
    },
  };
  constructor(
    private genreModel: typeof GenreModel,
    private uow: UnitOfWorkSequelize,
  ) {}

  async insert(entity: Genre): Promise<void> {
    await this.genreModel.create(GenreModelMapper.toModel(entity), {
      include: ['categoryIds'],
      transaction: this.uow.getTransaction(),
    });
  }

  async bulkInsert(entities: Genre[]): Promise<void> {
    const models = entities.map((e) => GenreModelMapper.toModel(e));
    await this.genreModel.bulkCreate(models, {
      include: ['categoryIds'],
      transaction: this.uow.getTransaction(),
    });
  }

  async findById(id: GenreId): Promise<Genre | null> {
    const model = await this._get(id.id);
    return model ? GenreModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      include: ['categoryIds'],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async findByIds(ids: GenreId[]): Promise<Genre[]> {
    const models = await this.genreModel.findAll({
      where: {
        genreId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      include: ['categoryIds'],
      transaction: this.uow.getTransaction(),
    });
    return models.map((m) => GenreModelMapper.toEntity(m));
  }

  async existsById(
    ids: GenreId[],
  ): Promise<{ existent: GenreId[]; nonExistent: GenreId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsGenreModels = await this.genreModel.findAll({
      attributes: ['genreId'],
      where: {
        genreId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
      transaction: this.uow.getTransaction(),
    });
    const existsGenreIds = existsGenreModels.map((m) => new GenreId(m.genreId));
    const notExistsGenreIds = ids.filter(
      (id) => !existsGenreIds.some((e) => e.equals(id)),
    );
    return {
      existent: existsGenreIds,
      nonExistent: notExistsGenreIds,
    };
  }

  async update(aggregate: Genre): Promise<void> {
    const model = await this._get(aggregate.genreId.id);

    if (!model) {
      throw new NotFoundError(aggregate.genreId.id, this.getEntity());
    }

    await model.$remove(
      'categories',
      model.categoryIds.map((c) => c.categoryId),
      {
        transaction: this.uow.getTransaction(),
      },
    );
    const { categoryIds, ...props } = GenreModelMapper.toModel(aggregate);
    await this.genreModel.update(props, {
      where: { genreId: aggregate.genreId.id },
      transaction: this.uow.getTransaction(),
    });
    await model.$add(
      'categories',
      categoryIds.map((c) => c.categoryId),
      {
        transaction: this.uow.getTransaction(),
      },
    );
  }

  async delete(id: GenreId): Promise<void> {
    const genreCategoryRelation =
      this.genreModel.associations.categoryIds.target;
    await genreCategoryRelation.destroy({
      where: { genreId: id.id },
      transaction: this.uow.getTransaction(),
    });
    const affectedRows = await this.genreModel.destroy({
      where: { genreId: id.id },
      transaction: this.uow.getTransaction(),
    });

    if (affectedRows !== 1) {
      throw new NotFoundError(id.id, this.getEntity());
    }
  }

  private async _get(id: string): Promise<GenreModel | null> {
    return this.genreModel.findByPk(id, {
      include: ['categoryIds'],
      transaction: this.uow.getTransaction(),
    });
  }

  async search(props: GenreSearchParams): Promise<GenreSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;
    const genreCategoryRelation =
      this.genreModel.associations.categoryIds.target;
    const genreTableName = this.genreModel.getTableName();
    const genreCategoryTableName = genreCategoryRelation.getTableName();
    const genreAlias = this.genreModel.name;

    const wheres: any[] = [];

    if (props.filter && (props.filter.name || props.filter.categoryIds)) {
      if (props.filter.name) {
        wheres.push({
          field: 'name',
          value: `%${props.filter.name}%`,
          get condition() {
            return {
              [this.field]: {
                [Op.like]: this.value,
              },
            };
          },
          rawCondition: `${genreAlias}.name LIKE :name`,
        });
      }

      if (props.filter.categoryIds) {
        wheres.push({
          field: 'category_ids',
          value: props.filter.categoryIds.map((c) => c.id),
          get condition() {
            return {
              ['$categoryIds.category_id$']: {
                [Op.in]: this.value,
              },
            };
          },
          rawCondition: `${genreCategoryTableName}.category_id IN (:category_ids)`,
        });
      }
    }

    const orderBy =
      props.sort && this.sortableFields.includes(props.sort)
        ? this.formatSort(props.sort, props.sortDir!)
        : `${genreAlias}.\`created_at\` DESC`;

    const count: number = await this.genreModel.count({
      distinct: true,
      include: [props.filter?.categoryIds && 'categoryIds'].filter((i) => i),
      where: wheres.length ? { [Op.and]: wheres.map((w) => w.condition) } : {},
      transaction: this.uow.getTransaction(),
    });

    const columnOrder = orderBy.replace('binary', '').trim().split(' ')[0];

    const query = [
      'SELECT',
      `DISTINCT ${genreAlias}.\`genre_id\`,${columnOrder} FROM ${genreTableName} as ${genreAlias}`,
      props.filter?.categoryIds
        ? `INNER JOIN ${genreCategoryTableName} ON ${genreAlias}.\`genre_id\` = ${genreCategoryTableName}.\`genre_id\``
        : '',
      wheres.length
        ? `WHERE ${wheres.map((w) => w.rawCondition).join(' AND ')}`
        : '',
      `ORDER BY ${orderBy}`,
      `LIMIT ${limit}`,
      `OFFSET ${offset}`,
    ];

    const [idsResult] = await this.genreModel.sequelize!.query(
      query.join(' '),
      {
        replacements: wheres.reduce(
          (acc, w) => ({ ...acc, [w.field]: w.value }),
          {},
        ),
        transaction: this.uow.getTransaction(),
      },
    );

    const models = await this.genreModel.findAll({
      where: {
        genreId: {
          [Op.in]: idsResult.map(
            (id: { genre_id: string }) => id.genre_id,
          ) as string[],
        },
      },
      include: ['categoryIds'],
      order: literal(orderBy),
      transaction: this.uow.getTransaction(),
    });

    return new GenreSearchResult({
      items: models.map((m) => GenreModelMapper.toEntity(m)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.genreModel.sequelize!.getDialect();
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }
    return `${this.genreModel.name}.\`${sort}\` ${sortDir}`;
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }
}
