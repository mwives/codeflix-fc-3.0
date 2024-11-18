import { DataType, Sequelize } from 'sequelize-typescript'
import { CategoryModel } from './category.model'

describe('CategoryModel', () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [CategoryModel],
      logging: false,
    })
    await sequelize.sync({ force: true })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  describe('Model attributes mapping', () => {
    it('should correctly map the attributes of the CategoryModel', () => {
      const attributesMap = CategoryModel.getAttributes()
      const attributes = Object.keys(attributesMap)

      expect(attributes).toStrictEqual([
        'categoryId',
        'name',
        'description',
        'isActive',
        'createdAt',
      ])

      expect(attributesMap.categoryId).toMatchObject({
        field: 'categoryId',
        fieldName: 'categoryId',
        primaryKey: true,
        type: DataType.UUID(),
      })

      expect(attributesMap.name).toMatchObject({
        field: 'name',
        fieldName: 'name',
        allowNull: false,
        type: DataType.STRING(255),
      })

      expect(attributesMap.description).toMatchObject({
        field: 'description',
        fieldName: 'description',
        allowNull: true,
        type: DataType.TEXT(),
      })

      expect(attributesMap.isActive).toMatchObject({
        field: 'is_active',
        fieldName: 'isActive',
        allowNull: false,
        type: DataType.BOOLEAN(),
      })

      expect(attributesMap.createdAt).toMatchObject({
        field: 'created_at',
        fieldName: 'createdAt',
        allowNull: false,
        type: DataType.DATE(3),
      })
    })
  })

  describe('Model data operations', () => {
    it('should create a CategoryModel instance with valid properties', async () => {
      const arrange = {
        categoryId: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'test',
        isActive: true,
        createdAt: new Date(),
      }
      const category = await CategoryModel.create(arrange)
      expect(category.toJSON()).toStrictEqual(arrange)
    })
  })
})
