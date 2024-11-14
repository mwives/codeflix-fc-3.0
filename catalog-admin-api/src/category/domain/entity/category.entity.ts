import { Entity } from '../../../shared/domain/entity/entity'
import { EntityValidationError } from '../../../shared/domain/validators/validation.error'
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { CategoryValidatorFactory } from '../validator/category.validator'

export type CategoryConstructorProps = {
  categoryId?: Uuid
  name: string
  description?: string | null
  isActive?: boolean
  createdAt?: Date
}

export type CategoryCreateCommand = {
  name: string
  description?: string | null
  isActive?: boolean
}

export class Category extends Entity {
  categoryId: Uuid
  name: string
  description: string | null
  isActive: boolean
  createdAt: Date

  constructor(props: CategoryConstructorProps) {
    super()
    this.categoryId = props.categoryId ?? new Uuid()
    this.name = props.name
    this.description = props.description ?? null
    this.isActive = props.isActive ?? true
    this.createdAt = props.createdAt ?? new Date()
  }

  get entityId(): Uuid {
    return this.categoryId
  }

  static create(props: CategoryCreateCommand): Category {
    const category = new Category(props)
    Category.validate(category)
    return category
  }

  changeName(name: string): void {
    this.name = name
    Category.validate(this)
  }

  changeDescription(description: string | null): void {
    this.description = description
    Category.validate(this)
  }

  activate(): void {
    this.isActive = true
  }

  deactivate(): void {
    this.isActive = false
  }

  static validate(entity: Category): void {
    const validator = CategoryValidatorFactory.create()
    const isValid = validator.validate(entity)
    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
  }

  toJSON() {
    return {
      categoryId: this.categoryId.id,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
    }
  }
}
