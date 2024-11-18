import { Op } from 'sequelize'
import { NotFoundError } from '../../../../shared/domain/error/not-found.error'
import { Uuid } from '../../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../../domain/entity/category.entity'
import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '../../../domain/repository/category.repository'
import { CategoryModel } from './category.model'
import { CategoryModelMapper } from './category-model-mapper'

export class CategorySequelizeRepository implements ICategoryRepository {
  sortableFields: string[] = ['name', 'created_at']

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity)
    await this.categoryModel.create(model.toJSON())
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON()
    )
    await this.categoryModel.bulkCreate(models)
  }

  async update(entity: Category): Promise<void> {
    const categoryId = entity.categoryId.id
    const category = await this._get(categoryId)

    if (!category) {
      throw new NotFoundError(categoryId, this.getEntity())
    }

    const model = CategoryModelMapper.toModel(entity)
    await this.categoryModel.update(model.toJSON(), {
      where: { categoryId },
    })
  }

  async delete(id: Uuid): Promise<void> {
    const category = await this._get(id.id)

    if (!category) {
      throw new NotFoundError(id.id, this.getEntity())
    }

    await this.categoryModel.destroy({ where: { categoryId: id.id } })
  }

  async findById(id: Uuid): Promise<Category | null> {
    const category = await this._get(id.id)
    return category ? CategoryModelMapper.toEntity(category) : null
  }

  private async _get(id: string) {
    return this.categoryModel.findByPk(id)
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryModel.findAll()
    return categories.map((category) => CategoryModelMapper.toEntity(category))
  }

  async search({
    filter,
    page,
    perPage,
    sort,
    sortDir,
  }: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (page - 1) * perPage

    const { count, rows } = await this.categoryModel.findAndCountAll({
      ...(filter && {
        where: {
          name: { [Op.like]: `%${filter}%` },
        },
      }),
      ...(sort && this.sortableFields.includes(sort)
        ? { order: [[sort, sortDir]] }
        : { order: [['createdAt', 'desc']] }),
      offset,
      limit: perPage,
    })

    return new CategorySearchResult({
      items: rows.map((category) => CategoryModelMapper.toEntity(category)),
      currentPage: page,
      perPage,
      total: count,
    })
  }

  getEntity(): new (...args: any[]) => Category {
    return Category
  }
}
