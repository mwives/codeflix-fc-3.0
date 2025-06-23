import { ClassValidatorFields } from '@core/shared/domain/validators/class-validator-fields';
import { Notification } from '@core/shared/domain/validators/notification';
import { MaxLength } from 'class-validator';
import { CastMember } from './cast-member.aggregate';

export class NestedCastMemberRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(entity: CastMember) {
    Object.assign(this, entity);
  }
}

export class NestedCastMemberValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(
      notification,
      new NestedCastMemberRules(data),
      newFields,
    );
  }
}

export class NestedCastMemberValidatorFactory {
  static create() {
    return new NestedCastMemberValidator();
  }
}

export default NestedCastMemberValidatorFactory;
