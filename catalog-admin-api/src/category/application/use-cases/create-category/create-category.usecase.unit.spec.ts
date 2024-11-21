import { EntityValidationError } from '../../../../shared/domain/validators/validation.error'
import { Category } from '../../../domain/entity/category.entity'
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository'
import {
  CreateCategoryInput,
  CreateCategoryUseCase,
} from './create-category.usecase'

describe('CreateCategoryUseCase Unit Tests', () => {
  let useCase: CreateCategoryUseCase
  let categoryRepository: CategoryInMemoryRepository

  beforeEach(() => {
    categoryRepository = new CategoryInMemoryRepository()
    useCase = new CreateCategoryUseCase(categoryRepository)
  })

  describe('execute', () => {
    it('should create a category', async () => {
      const input: CreateCategoryInput = {
        name: 'Category 1',
        description: 'Description 1',
        isActive: true,
      }

      const category = Category.create(input)
      const insertSpy = jest
        .spyOn(categoryRepository, 'insert')
        .mockResolvedValueOnce()

      const output = await useCase.execute(input)

      expect(insertSpy).toHaveBeenCalledTimes(1)
      expect(output).toEqual({
        id: expect.any(String),
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: expect.any(Date),
      })
    })

    it('should create a category without description and isActive', async () => {
      const input: CreateCategoryInput = {
        name: 'Category 1',
      }

      const category = Category.create(input)
      const insertSpy = jest
        .spyOn(categoryRepository, 'insert')
        .mockResolvedValueOnce()

      const output = await useCase.execute(input)

      expect(insertSpy).toHaveBeenCalledTimes(1)
      expect(output).toEqual({
        id: expect.any(String),
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: expect.any(Date),
      })
    })

    it('should throw an error if entity is invalid', async () => {
      const input: CreateCategoryInput = {
        name: 't'.repeat(256),
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError
      )
    })
  })
})
