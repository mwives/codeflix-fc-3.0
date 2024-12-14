import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/entity/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberOutputMapper } from './cast-member-output';

describe('CastMemberOutputMapper', () => {
  it('should map to DTO', () => {
    const castMember = CastMember.create({
      name: 'John Doe',
      type: CastMemberType.createADirector(),
    });

    const output = CastMemberOutputMapper.toDTO(castMember);

    expect(output).toEqual({
      id: castMember.castMemberId.id,
      name: 'John Doe',
      type: CastMemberTypes.DIRECTOR,
      createdAt: castMember.createdAt,
    });
  });
});
