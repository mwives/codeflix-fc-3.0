import { Sequelize } from 'sequelize-typescript'
import {
  InvalidUuidError,
  Uuid,
} from '../../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../../domain/entity/category.entity'
import { CategoryModelMapper } from './category-model-mapper'
import { CategoryModel } from './category.model'

describe('CategoryModelMapper', () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [CategoryModel],
      logging: false,
    })
    await sequelize.sync({ force: true })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  describe('toModel', () => {
    it('should return a CategoryModel instance', () => {
      const category = new Category({
        categoryId: new Uuid(),
        name: 'any_name',
        description: 'any_description',
        isActive: true,
        createdAt: new Date(),
      })

      const result = CategoryModelMapper.toModel(category)

      expect(result).toBeInstanceOf(CategoryModel)
      expect(result).toMatchObject({
        categoryId: category.categoryId.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
      })
    })
  })

  describe('toEntity', () => {
    it('should return a Category instance', () => {
      const categoryModel = CategoryModel.build({
        categoryId: new Uuid().id,
        name: 'any_name',
        description: 'any_description',
        isActive: true,
        createdAt: new Date(),
      })

      const result = CategoryModelMapper.toEntity(categoryModel)

      expect(result).toBeInstanceOf(Category)
      expect(result).toMatchObject({
        categoryId: new Uuid(categoryModel.categoryId),
        name: categoryModel.name,
        description: categoryModel.description,
        isActive: categoryModel.isActive,
        createdAt: categoryModel.createdAt,
      })
    })

    it('should throw an InvalidUuidError if the entity is invalid', () => {
      const categoryModel = CategoryModel.build({
        categoryId: 'invalid_uuid',
        name: 'any_name',
        description: 'any_description',
        isActive: true,
        createdAt: new Date(),
      })

      expect(() => CategoryModelMapper.toEntity(categoryModel)).toThrow(
        InvalidUuidError
      )
    })
  })
})
