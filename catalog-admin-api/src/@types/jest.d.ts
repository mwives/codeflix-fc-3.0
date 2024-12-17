import { ValueObject } from '@core/shared/domain/value-object/value-object';
import { FieldsErrors } from '../nest-modules/shared-module/domain/validators/validator-fields-interface';

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainNotificationErrorMessages: (expected: FieldsErrors) => R;
      toBeValueObject: (expected: ValueObject) => R;
    }
  }
}
