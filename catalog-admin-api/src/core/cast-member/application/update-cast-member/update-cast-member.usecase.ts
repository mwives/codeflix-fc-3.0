import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../@shared/cast-member-output';
import { UpdateCastMemberInput } from './update-cast-member.input';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private readonly castMemberRepository: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
    const castMemberId = new CastMemberId(input.id);
    const castMember = await this.castMemberRepository.findById(castMemberId);

    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    if (input.name) {
      castMember.changeName(input.name);
    }

    if (input.type) {
      const [type, errorCastMemberType] = CastMemberType.create(
        input.type,
      ).asArray();

      castMember.changeType(type);

      errorCastMemberType &&
        castMember.notification.setError(errorCastMemberType.message, 'type');
    }

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepository.update(castMember);

    return CastMemberOutputMapper.toDTO(castMember);
  }
}

export type UpdateCastMemberOutput = CastMemberOutput;
