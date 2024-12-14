import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
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
    const castMember = new CastMember({
      castMemberId: new CastMemberId(model.castMemberId),
      name: model.name,
      type: CastMemberType.create(model.type),
      createdAt: model.createdAt,
    });

    castMember.validate();

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    return castMember;
  }
}
