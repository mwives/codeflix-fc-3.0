import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CreateCastMemberUseCase } from './create-cast-member.usecase';

describe('CreateCastMemberUseCase Integration Tests', () => {
  let useCase: CreateCastMemberUseCase;
  let castMemberRepository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should create a cast member', async () => {
      const input = {
        name: 'any_name',
        type: 1,
      };

      const output = await useCase.execute(input);

      const castMember = await castMemberRepository.findById(
        new CastMemberId(output.id),
      );

      expect(output).toEqual({
        id: castMember.castMemberId.id,
        name: input.name,
        type: input.type,
        createdAt: castMember.createdAt,
      });
    });
  });
});
