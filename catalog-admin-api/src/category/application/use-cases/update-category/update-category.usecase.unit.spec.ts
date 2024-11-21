import { NotFoundError } from '../../../../shared/domain/error/not-found.error'
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error'
import { InvalidUuidError } from '../../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../../domain/entity/category.entity'
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository'
import {
  UpdateCategoryInput,
  UpdateCategoryUseCase,
} from './update-category.usecase'

describe('UpdateCategoryUseCase Unit Tests', () => {
  let useCase: UpdateCategoryUseCase
  let repository: CategoryInMemoryRepository

  beforeEach(() => {
    repository = new CategoryInMemoryRepository()
    useCase = new UpdateCategoryUseCase(repository)
  })

  describe('execute', () => {
    it('should throw ValidationError when id is not a valid uuid', async () => {
      const input = { id: 'invalid_uuid' }
      await expect(useCase.execute(input)).rejects.toThrow(InvalidUuidError)
    })

    it('should throw NotFoundError when category does not exist', async () => {
      const input = { id: '123e4567-e89b-12d3-a456-426614174000' }
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundError(input.id, Category)
      )
    })

    it('should throw error if entity is invalid', async () => {
      const category = Category.fake().aCategory().build()

      await repository.insert(category)

      const input = { id: category.categoryId.id, name: 't'.repeat(256) }

      await expect(useCase.execute(input)).rejects.toThrow(
        new EntityValidationError(['name'])
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

    it('should update only name field', async () => {
      const category = Category.fake().aCategory().build()

      await repository.insert(category)

      const input: UpdateCategoryInput = {
        id: category.categoryId.id,
        name: 'new_name',
      }

      const output = await useCase.execute(input)

      expect(output).toEqual({
        id: category.categoryId.id,
        name: input.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
      })
    })
  })
})
