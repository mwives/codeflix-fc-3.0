import { ClassValidatorFields } from '@core/shared/domain/validators/class-validator-fields';
import { Notification } from '@core/shared/domain/validators/notification';
import { MaxLength } from 'class-validator';
import { Video } from './video.aggregate';

export class VideoRules {
  @MaxLength(255, { groups: ['title'] })
  title: string;

  constructor(aggregate: Video) {
    Object.assign(this, aggregate);
  }
}

export class VideoValidator extends ClassValidatorFields {
  validate(
    notification: Notification,
    data: Video,
    fields?: string[],
  ): boolean {
    const newFields = fields?.length ? fields : ['title'];
    return super.validate(notification, new VideoRules(data), newFields);
  }
}

export class VideoValidatorFactory {
  static create() {
    return new VideoValidator();
  }
}

export default VideoValidatorFactory;
