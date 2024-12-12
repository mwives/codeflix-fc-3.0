import { MaxLength } from 'class-validator';

import { ClassValidatorFields } from '@core/shared/domain/validators/class-validator-fields';
import { Notification } from '@core/shared/domain/validators/notification';
import { Category } from '../entity/category.entity';

export class CategoryRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(category: Category) {
    Object.assign(this, category);
  }
}

export class CategoryValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new CategoryRules(data), newFields);
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}
