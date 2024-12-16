import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { CastMemberModel } from './cast-member.model';

export class CastMemberModelMapper {
  static toModel(entity: CastMember) {
    return CastMemberModel.build({
      castMemberId: entity.castMemberId.id,
      name: entity.name,
      type: entity.type.type,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(model: CastMemberModel) {
    const { castMemberId, ...castMemberData } = model.toJSON();
    const [type, castMemberTypeError] = CastMemberType.create(
      castMemberData.type,
    ).asArray();

    const castMember = new CastMember({
      ...castMemberData,
      castMemberId: new CastMemberId(model.castMemberId),
      type,
    });

    const notification = castMember.notification;
    if (castMemberTypeError) {
      notification.setError(castMemberTypeError.message, 'type');
    }

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return castMember;
  }
}
