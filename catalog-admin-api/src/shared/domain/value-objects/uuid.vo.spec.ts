import { validate as uuidValidate } from 'uuid'
import { InvalidUuidError, Uuid } from './uuid.vo'

describe('Uuid', () => {
  const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate')

  describe('constructor', () => {
    it('should generate a new valid id when no id is provided', () => {
      const uuid = new Uuid()
      expect(uuid.id).toBeDefined()
      expect(validateSpy).toHaveBeenCalled()
      expect(uuidValidate(uuid.id)).toBe(true)
    })

    it('should use the provided id', () => {
      const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      const uuid = new Uuid(id)
      expect(uuid.id).toBe(id)
    })
  })

  describe('validate', () => {
    it('should throw error when id is invalid', () => {
      const invalidId = 'invalid-id'
      expect(() => new Uuid(invalidId)).toThrow(InvalidUuidError)
      expect(validateSpy).toHaveBeenCalled()
    })

    it('should not throw error when id is valid', () => {
      const validId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      expect(() => new Uuid(validId)).not.toThrow()
      expect(validateSpy).toHaveBeenCalled()
    })
  })
})
