import { Chance } from 'chance'
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from './category.entity'

type PropOrFactory<T> = T | ((index: number) => T)

export class CategoryFakeBuilder<TBuild = any> {
  // auto generated in entity
  private _categoryId: PropOrFactory<Uuid> | undefined = undefined
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _name: PropOrFactory<string> = (_index) => this.chance.word()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _description: PropOrFactory<string | null> = (_index) =>
    this.chance.paragraph()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _isActive: PropOrFactory<boolean> = (_index) => true
  // auto generated in entity
  private _createdAt: PropOrFactory<Date> | undefined = undefined

  private countObjs

  static aCategory() {
    return new CategoryFakeBuilder<Category>()
  }

  static theCategories(countObjs: number) {
    return new CategoryFakeBuilder<Category[]>(countObjs)
  }

  private chance: Chance.Chance

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs
    this.chance = Chance()
  }

  withUuid(valueOrFactory: PropOrFactory<Uuid>) {
    this._categoryId = valueOrFactory
    return this
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory
    return this
  }

  withDescription(valueOrFactory: PropOrFactory<string | null>) {
    this._description = valueOrFactory
    return this
  }

  activate() {
    this._isActive = true
    return this
  }

  deactivate() {
    this._isActive = false
    return this
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory
    return this
  }

  withInvalidNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 })
    return this
  }

  build(): TBuild {
    const categories = new Array(this.countObjs)
      .fill(undefined)
      .map((_, index) => {
        const category = new Category({
          categoryId: !this._categoryId
            ? undefined
            : this.callFactory(this._categoryId, index),
          name: this.callFactory(this._name, index),
          description: this.callFactory(this._description, index),
          isActive: this.callFactory(this._isActive, index),
          ...(this._createdAt && {
            createdAt: this.callFactory(this._createdAt, index),
          }),
        })
        //category.validate();
        return category
      })
    return this.countObjs === 1
      ? (categories[0] as TBuild)
      : (categories as TBuild)
  }

  get categoryId() {
    return this.getValue('categoryId')
  }

  get name() {
    return this.getValue('name')
  }

  get description() {
    return this.getValue('description')
  }

  get isActive() {
    return this.getValue('isActive')
  }

  get createdAt() {
    return this.getValue('createdAt')
  }

  private getValue(prop: any) {
    const optional = ['categoryId', 'createdAt']
    const privateProp = `_${prop}` as keyof this
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(`Property ${prop} not have a factory, use 'with' methods`)
    }
    return this.callFactory(this[privateProp], 0)
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === 'function'
      ? factoryOrValue(index)
      : factoryOrValue
  }
}
