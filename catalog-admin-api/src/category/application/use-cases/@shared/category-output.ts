import { Category } from '../../../domain/entity/category.entity'

export type CategoryOutput = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date
}

export class CategoryOutputMapper {
  static toDTO(entity: Category): CategoryOutput {
    const { categoryId, ...category } = entity.toJSON()
    return {
      id: categoryId,
      ...category,
    }
  }
}
