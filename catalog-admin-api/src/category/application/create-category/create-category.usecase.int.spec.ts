import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { setupSequelize } from '../../../shared/infra/testing/helpers'
import { CategorySequelizeRepository } from '../../infra/db/sequelize/category-sequelize.repository'
import { CategoryModel } from '../../infra/db/sequelize/category.model'
import {
  CreateCategoryInput,
  CreateCategoryUseCase,
} from './create-category.usecase'

describe('CreateCategoryUseCase Integration Tests', () => {
  let useCase: CreateCategoryUseCase
  let categoryRepository: CategorySequelizeRepository

  setupSequelize({ models: [CategoryModel] })

  beforeEach(() => {
    categoryRepository = new CategorySequelizeRepository(CategoryModel)
    useCase = new CreateCategoryUseCase(categoryRepository)
  })

  describe('execute', () => {
    it('should create a category', async () => {
      const input: CreateCategoryInput = {
        name: 'any_name',
        description: 'any_description',
        isActive: true,
      }

      const output = await useCase.execute(input)

      const category = await categoryRepository.findById(new Uuid(output.id))

      expect(output).toEqual({
        id: category.entityId.id,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        createdAt: category.createdAt,
      })
    })

    it('should create a category without optional values', async () => {
      const input: CreateCategoryInput = {
        name: 'any_name',
      }

      const output = await useCase.execute(input)

      const category = await categoryRepository.findById(new Uuid(output.id))

      expect(output).toEqual({
        id: category.entityId.id,
        name: input.name,
        description: null,
        isActive: true,
        createdAt: category.createdAt,
      })
    })
  })
})
