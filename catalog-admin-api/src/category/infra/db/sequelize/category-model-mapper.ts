import { EntityValidationError } from '../../../../shared/domain/validators/validation.error'
import { Uuid } from '../../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../../domain/entity/category.entity'
import { CategoryModel } from './category.model'

export class CategoryModelMapper {
  static toModel(category: Category): CategoryModel {
    return CategoryModel.build({
      categoryId: category.categoryId.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    })
  }

  static toEntity(categoryModel: CategoryModel): Category {
    const category = new Category({
      categoryId: new Uuid(categoryModel.categoryId),
      name: categoryModel.name,
      description: categoryModel.description,
      isActive: categoryModel.isActive,
      createdAt: categoryModel.createdAt,
    })

    category.validate()
    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON())
    }

    return category
  }
}
