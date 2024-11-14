import { FieldErrors } from './validator-fields-interface'

export class EntityValidationError extends Error {
  constructor(public errors: FieldErrors, message = 'Validation error') {
    super(message)
    this.name = 'EntityValidationError'
  }

  count(): number {
    return Object.keys(this.errors).length
  }
}
