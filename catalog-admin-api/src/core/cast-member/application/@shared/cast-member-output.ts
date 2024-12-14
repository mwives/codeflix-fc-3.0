import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: number;
  createdAt: Date;
};

export class CastMemberOutputMapper {
  static toDTO(entity: CastMember): CastMemberOutput {
    const { castMemberId, ...castMember } = entity.toJSON();
    return {
      id: castMemberId,
      ...castMember,
    };
  }
}
