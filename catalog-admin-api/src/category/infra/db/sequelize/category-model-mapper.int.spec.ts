import { EntityValidationError } from '../../../../shared/domain/validators/validation.error'
import {
  InvalidUuidError,
  Uuid,
} from '../../../../shared/domain/value-object/value-objects/uuid.vo'
import { setupSequelize } from '../../../../shared/infra/testing/helpers'
import { Category } from '../../../domain/entity/category.entity'
import { CategoryModelMapper } from './category-model-mapper'
import { CategoryModel } from './category.model'

describe('CategoryModelMapper', () => {
  setupSequelize({ models: [CategoryModel] })

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

    it('should throw an EntityValidationError if the entity is invalid', () => {
      const categoryModel = CategoryModel.build({
        categoryId: new Uuid().id,
        name: 't'.repeat(256),
        description: 'any_description',
        isActive: true,
        createdAt: new Date(),
      })

      expect(() => CategoryModelMapper.toEntity(categoryModel)).toThrow(
        EntityValidationError
      )
    })
  })
})
