import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberOutputMapper } from '../@shared/cast-member-output';
import { GetCastMemberUseCase } from './get-cast-member.usecase';

describe('GetCastMember Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  let getCastMemberUseCase: GetCastMemberUseCase;
  let castMemberRepository: CastMemberSequelizeRepository;

  beforeAll(() => {
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    getCastMemberUseCase = new GetCastMemberUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should get a cast member', async () => {
      const castMember = CastMember.create({
        name: 'any_name',
        type: CastMemberType.createADirector(),
      });

      await castMemberRepository.insert(castMember);

      const result = await getCastMemberUseCase.execute(
        castMember.castMemberId,
      );

      expect(result).toEqual(CastMemberOutputMapper.toDTO(castMember));
    });
  });
});
