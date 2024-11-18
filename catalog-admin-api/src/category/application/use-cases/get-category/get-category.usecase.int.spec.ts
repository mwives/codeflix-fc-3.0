import { NotFoundError } from '../../../../shared/domain/error/not-found.error'
import { Category } from '../../../domain/entity/category.entity'
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository'
import { GetCategoryInput, GetCategoryUseCase } from './get-category.usecase'

describe('GetCategoryUseCase Integration Tests', () => {
  let useCase: GetCategoryUseCase
  let repository: CategoryInMemoryRepository

  beforeEach(() => {
    repository = new CategoryInMemoryRepository()
    useCase = new GetCategoryUseCase(repository)
  })

  describe('execute', () => {
    it('should throw NotFoundError when category does not exist', async () => {
      const input: GetCategoryInput = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundError(input.id, Category)
      )
    })

    it('should return a category successfully', async () => {
      const category = Category.fake().aCategory().build()

      await repository.insert(category)

      const input: GetCategoryInput = { id: category.categoryId.id }
      const output = await useCase.execute(input)

      expect(output).toEqual({
        id: category.categoryId.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
      })
    })
  })
})
