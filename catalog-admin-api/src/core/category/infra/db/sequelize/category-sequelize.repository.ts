import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { literal, Op } from 'sequelize';
import { NotFoundError } from '../../../../shared/domain/error/not-found.error';
import { Category, CategoryId } from '../../../domain/entity/category.entity';
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/repository/category.repository';
import { CategoryModelMapper } from './category-model-mapper';
import { CategoryModel } from './category.model';

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at'];
  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) => literal(`binary name ${sortDir}`), //ascii
    },
  };

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity);
    await this.categoryModel.create(model.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON(),
    );
    await this.categoryModel.bulkCreate(models);
  }

  async update(entity: Category): Promise<void> {
    const categoryId = entity.categoryId.id;
    const category = await this._get(categoryId);

    if (!category) {
      throw new NotFoundError(categoryId, this.getEntity());
    }

    const model = CategoryModelMapper.toModel(entity);
    await this.categoryModel.update(model.toJSON(), {
      where: { categoryId },
    });
  }

  async delete(id: CategoryId): Promise<void> {
    const category = await this._get(id.id);

    if (!category) {
      throw new NotFoundError(id.id, this.getEntity());
    }

    await this.categoryModel.destroy({ where: { categoryId: id.id } });
  }

  async findById(id: CategoryId): Promise<Category | null> {
    const category = await this._get(id.id);
    return category ? CategoryModelMapper.toEntity(category) : null;
  }

  async findByIds(ids: CategoryId[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        categoryId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  private async _get(id: string) {
    return this.categoryModel.findByPk(id);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryModel.findAll();
    return categories.map((category) => CategoryModelMapper.toEntity(category));
  }

  async existsById(
    ids: CategoryId[],
  ): Promise<{ existent: CategoryId[]; nonExistent: CategoryId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['categoryId'],
      where: {
        categoryId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });

    const existsCategoryIds = existsCategoryModels.map(
      (m) => new CategoryId(m.categoryId),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );

    return {
      existent: existsCategoryIds,
      nonExistent: notExistsCategoryIds,
    };
  }

  async search({
    filter,
    page,
    perPage,
    sort,
    sortDir,
  }: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (page - 1) * perPage;

    const { count, rows } = await this.categoryModel.findAndCountAll({
      ...(filter && {
        where: {
          name: { [Op.like]: `%${filter}%` },
        },
      }),
      ...(sort && this.sortableFields.includes(sort)
        ? { order: this.formatSort(sort, sortDir) }
        : { order: [['createdAt', 'desc']] }),
      offset,
      limit: perPage,
    });

    return new CategorySearchResult({
      items: rows.map((category) => CategoryModelMapper.toEntity(category)),
      currentPage: page,
      perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }
    return [[sort, sortDir]];
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
