import { NotFoundError } from '../../../shared/domain/error/not-found.error'
import { InvalidUuidError } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../domain/entity/category.entity'
import { CategoryInMemoryRepository } from '../../infra/db/in-memory/category-in-memory.repository'
import {
  UpdateCategoryInput,
  UpdateCategoryUseCase,
} from './update-category.usecase'

describe('UpdateCategoryUseCase Integration Tests', () => {
  let useCase: UpdateCategoryUseCase
  let repository: CategoryInMemoryRepository

  beforeEach(() => {
    repository = new CategoryInMemoryRepository()
    useCase = new UpdateCategoryUseCase(repository)
  })

  describe('execute', () => {
    it('should throw NotFoundError when category does not exist', async () => {
      const input = { id: '123e4567-e89b-12d3-a456-426614174000' }
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundError(input.id, Category)
      )
    })

    it('should update category fields', async () => {
      const category = Category.fake().aCategory().build()

      await repository.insert(category)

      const input: UpdateCategoryInput = {
        id: category.categoryId.id,
        name: 'new_name',
        description: 'new_description',
        isActive: false,
      }

      const output = await useCase.execute(input)

      expect(output).toEqual({
        id: category.categoryId.id,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        createdAt: category.createdAt,
      })
    })
  })
})