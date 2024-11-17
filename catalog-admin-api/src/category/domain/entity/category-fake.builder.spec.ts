import { Chance } from 'chance'
import { CategoryFakeBuilder } from './category-fake.builder'
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'

describe('CategoryFakerBuilder Unit Tests', () => {
  describe('categoryId prop', () => {
    const faker = CategoryFakeBuilder.aCategory()

    test('should throw error when any with methods has called', () => {
      expect(() => faker.categoryId).toThrow(
        new Error("Property categoryId not have a factory, use 'with' methods")
      )
    })

    test('should be undefined', () => {
      expect(faker['_categoryId']).toBeUndefined()
    })

    test('withUuid', () => {
      const categoryId = new Uuid()
      const $this = faker.withUuid(categoryId)
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_categoryId']).toBe(categoryId)

      faker.withUuid(() => categoryId)
      //@ts-expect-error _categoryId is a callable
      expect(faker['_categoryId']()).toBe(categoryId)

      expect(faker.categoryId).toBe(categoryId)
    })

    //TODO - melhorar este nome
    test('should pass index to categoryId factory', () => {
      let mockFactory = jest.fn(() => new Uuid())
      faker.withUuid(mockFactory)
      faker.build()
      expect(mockFactory).toHaveBeenCalledTimes(1)

      const categoryId = new Uuid()
      mockFactory = jest.fn(() => categoryId)
      const fakerMany = CategoryFakeBuilder.theCategories(2)
      fakerMany.withUuid(mockFactory)
      fakerMany.build()

      expect(mockFactory).toHaveBeenCalledTimes(2)
      expect(fakerMany.build()[0].categoryId).toBe(categoryId)
      expect(fakerMany.build()[1].categoryId).toBe(categoryId)
    })
  })

  describe('name prop', () => {
    const faker = CategoryFakeBuilder.aCategory()
    test('should be a function', () => {
      expect(typeof faker['_name']).toBe('function')
    })

    test('should call the word method', () => {
      const chance = Chance()
      const spyWordMethod = jest.spyOn(chance, 'word')
      faker['chance'] = chance
      faker.build()

      expect(spyWordMethod).toHaveBeenCalled()
    })

    test('withName', () => {
      const $this = faker.withName('test name')
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_name']).toBe('test name')

      faker.withName(() => 'test name')
      //@ts-expect-error name is callable
      expect(faker['_name']()).toBe('test name')

      expect(faker.name).toBe('test name')
    })

    test('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`)
      const category = faker.build()
      expect(category.name).toBe(`test name 0`)

      const fakerMany = CategoryFakeBuilder.theCategories(2)
      fakerMany.withName((index) => `test name ${index}`)
      const categories = fakerMany.build()

      expect(categories[0].name).toBe(`test name 0`)
      expect(categories[1].name).toBe(`test name 1`)
    })

    test('invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong()
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_name'].length).toBe(256)

      const tooLong = 'a'.repeat(256)
      faker.withInvalidNameTooLong(tooLong)
      expect(faker['_name'].length).toBe(256)
      expect(faker['_name']).toBe(tooLong)
    })
  })

  describe('description prop', () => {
    const faker = CategoryFakeBuilder.aCategory()
    test('should be a function', () => {
      expect(typeof faker['_description']).toBe('function')
    })

    test('should call the paragraph method', () => {
      const chance = Chance()
      const spyParagraphMethod = jest.spyOn(chance, 'paragraph')
      faker['chance'] = chance
      faker.build()
      expect(spyParagraphMethod).toHaveBeenCalled()
    })

    test('withDescription', () => {
      const $this = faker.withDescription('test description')
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_description']).toBe('test description')

      faker.withDescription(() => 'test description')
      //@ts-expect-error description is callable
      expect(faker['_description']()).toBe('test description')

      expect(faker.description).toBe('test description')
    })

    test('should pass index to description factory', () => {
      faker.withDescription((index) => `test description ${index}`)
      const category = faker.build()
      expect(category.description).toBe(`test description 0`)

      const fakerMany = CategoryFakeBuilder.theCategories(2)
      fakerMany.withDescription((index) => `test description ${index}`)
      const categories = fakerMany.build()

      expect(categories[0].description).toBe(`test description 0`)
      expect(categories[1].description).toBe(`test description 1`)
    })
  })

  describe('isActive prop', () => {
    const faker = CategoryFakeBuilder.aCategory()
    test('should be a function', () => {
      expect(typeof faker['_isActive']).toBe('function')
    })

    test('activate', () => {
      const $this = faker.activate()
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_isActive']).toBe(true)
      expect(faker.isActive).toBe(true)
    })

    test('deactivate', () => {
      const $this = faker.deactivate()
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_isActive']).toBe(false)
      expect(faker.isActive).toBe(false)
    })
  })

  describe('createdAt prop', () => {
    const faker = CategoryFakeBuilder.aCategory()

    test('should throw error when any with methods has called', () => {
      const fakerCategory = CategoryFakeBuilder.aCategory()
      expect(() => fakerCategory.createdAt).toThrow(
        new Error("Property createdAt not have a factory, use 'with' methods")
      )
    })

    test('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined()
    })

    test('withCreatedAt', () => {
      const date = new Date()
      const $this = faker.withCreatedAt(date)
      expect($this).toBeInstanceOf(CategoryFakeBuilder)
      expect(faker['_createdAt']).toBe(date)

      faker.withCreatedAt(() => date)
      //@ts-expect-error _createdAt is a callable
      expect(faker['_createdAt']()).toBe(date)
      expect(faker.createdAt).toBe(date)
    })

    test('should pass index to createdAt factory', () => {
      const date = new Date()
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2))
      const category = faker.build()
      expect(category.createdAt.getTime()).toBe(date.getTime() + 2)

      const fakerMany = CategoryFakeBuilder.theCategories(2)
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2))
      const categories = fakerMany.build()

      expect(categories[0].createdAt.getTime()).toBe(date.getTime() + 2)
      expect(categories[1].createdAt.getTime()).toBe(date.getTime() + 3)
    })
  })

  test('should create a category', () => {
    const faker = CategoryFakeBuilder.aCategory()
    let category = faker.build()

    expect(category.categoryId).toBeInstanceOf(Uuid)
    expect(typeof category.name === 'string').toBeTruthy()
    expect(typeof category.description === 'string').toBeTruthy()
    expect(category.isActive).toBe(true)
    expect(category.createdAt).toBeInstanceOf(Date)

    const createdAt = new Date()
    const categoryId = new Uuid()
    category = faker
      .withUuid(categoryId)
      .withName('name test')
      .withDescription('description test')
      .deactivate()
      .withCreatedAt(createdAt)
      .build()

    expect(category.categoryId.id).toBe(categoryId.id)
    expect(category.name).toBe('name test')
    expect(category.description).toBe('description test')
    expect(category.isActive).toBe(false)
    expect(category.createdAt).toBe(createdAt)
  })

  test('should create many categories', () => {
    const faker = CategoryFakeBuilder.theCategories(2)
    let categories = faker.build()

    categories.forEach((category) => {
      expect(category.categoryId).toBeInstanceOf(Uuid)
      expect(typeof category.name === 'string').toBeTruthy()
      expect(typeof category.description === 'string').toBeTruthy()
      expect(category.isActive).toBe(true)
      expect(category.createdAt).toBeInstanceOf(Date)
    })

    const createdAt = new Date()
    const categoryId = new Uuid()
    categories = faker
      .withUuid(categoryId)
      .withName('name test')
      .withDescription('description test')
      .deactivate()
      .withCreatedAt(createdAt)
      .build()

    categories.forEach((category) => {
      expect(category.categoryId.id).toBe(categoryId.id)
      expect(category.name).toBe('name test')
      expect(category.description).toBe('description test')
      expect(category.isActive).toBe(false)
      expect(category.createdAt).toBe(createdAt)
    })
  })
})
