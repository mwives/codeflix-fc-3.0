import { UpdateCastMemberInput } from '@core/cast-member/application/usecases/update-cast-member/update-cast-member.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateCastMemberInputWithoutId extends OmitType(
  UpdateCastMemberInput,
  ['id'] as any,
) {}

export class UpdateCastMemberDto extends UpdateCastMemberInputWithoutId {}
