import { FieldsErrors } from './validator-fields-interface';

export class EntityValidationError extends Error {
  constructor(
    public errors: FieldsErrors[],
    message = 'Entity Validation error',
  ) {
    super(message);
    this.name = 'EntityValidationError';
  }
}
