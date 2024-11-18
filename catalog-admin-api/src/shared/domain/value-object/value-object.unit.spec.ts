import { ValueObject } from './value-object'

class StringValueObject extends ValueObject {
  constructor(readonly valueStr: string, readonly valueNum: number) {
    super()
  }
}

describe('ValueObject', () => {
  describe('equals', () => {
    it('should return true when two value objects are equal', () => {
      const valueObject1 = new StringValueObject('value', 1)
      const valueObject2 = new StringValueObject('value', 1)

      expect(valueObject1.equals(valueObject2)).toBe(true)
    })

    it('should return false when two value objects are not equal', () => {
      const valueObject1 = new StringValueObject('value1', 1)
      const valueObject2 = new StringValueObject('value2', 2)

      expect(valueObject1.equals(valueObject2)).toBe(false)
    })

    it('should return false when null or undefined is passed', () => {
      const valueObject = new StringValueObject('value', 1)

      expect(valueObject.equals(null as any)).toBe(false)
      expect(valueObject.equals(undefined as any)).toBe(false)
    })

    it('should return false when the constructor names are different', () => {
      const valueObject1 = new StringValueObject('value', 1)
      const valueObject2 = new (class extends ValueObject {
        constructor(readonly valueStr: string, readonly valueNum: number) {
          super()
        }
      })('value', 1)

      expect(valueObject1.equals(valueObject2)).toBe(false)
    })
  })
})
