import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { DeleteCastMemberUseCase } from './delete-cast-member.usecase';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';

describe('DeleteCastMemberUsecase Integration tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteCastMemberUseCase(repository);
  });

  describe('execute', () => {
    it('should delete cast member', async () => {
      const castMember = CastMember.fake().aDirector().build();
      await repository.insert(castMember);

      const createdCastMember = await repository.findById(
        castMember.castMemberId,
      );

      expect(createdCastMember).not.toBeNull();

      await useCase.execute(castMember.castMemberId);

      const result = await repository.findById(castMember.castMemberId);

      expect(result).toBeNull();
    });
  });
});
