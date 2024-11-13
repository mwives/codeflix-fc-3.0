import { Category } from './category.entity'

describe('CategoryEntity', () => {
  describe('constructor', () => {
    it('should create instance with default values', () => {
      const category = new Category({
        name: 'any_category',
      })

      expect(category.categoryId).toBeUndefined()
      expect(category.name).toBe('any_category')
      expect(category.description).toBeNull()
      expect(category.isActive).toBe(true)
      expect(category.createdAt).toBeInstanceOf(Date)
    })

    it('should create instance with given values', () => {
      const now = new Date()
      const category = new Category({
        categoryId: 'any_id',
        name: 'any_category',
        description: 'any_description',
        isActive: false,
        createdAt: now,
      })

      expect(category.categoryId).toBe('any_id')
      expect(category.name).toBe('any_category')
      expect(category.description).toBe('any_description')
      expect(category.isActive).toBe(false)
      expect(category.createdAt).toBe(now)
    })
  })

  describe('create', () => {
    it('should create instance with given values', () => {
      const category = Category.create({
        name: 'any_category',
        description: 'any_description',
        isActive: false,
      })

      expect(category.categoryId).toBeUndefined()
      expect(category.name).toBe('any_category')
      expect(category.description).toBe('any_description')
      expect(category.isActive).toBe(false)
      expect(category.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('changeName', () => {
    it('should change name', () => {
      const category = new Category({
        name: 'any_category',
      })
      category.changeName('new_category')
      expect(category.name).toBe('new_category')
    })
  })

  describe('changeDescription', () => {
    it('should change description', () => {
      const category = new Category({
        name: 'any_category',
      })
      category.changeDescription('new_description')
      expect(category.description).toBe('new_description')
    })
  })

  describe('activate', () => {
    it('should activate category', () => {
      const category = new Category({
        name: 'any_category',
        isActive: false,
      })
      category.activate()
      expect(category.isActive).toBe(true)
    })
  })

  describe('deactivate', () => {
    it('should deactivate category', () => {
      const category = new Category({
        name: 'any_category',
        isActive: true,
      })
      category.deactivate()
      expect(category.isActive).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return JSON', () => {
      const now = new Date()
      const category = new Category({
        categoryId: 'any_id',
        name: 'any_category',
        description: 'any_description',
        isActive: false,
        createdAt: now,
      })

      expect(category.toJSON()).toEqual({
        categoryId: 'any_id',
        name: 'any_category',
        description: 'any_description',
        isActive: false,
        createdAt: now,
      })
    })
  })
})
