import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberOutputMapper } from '../@shared/cast-member-output';
import { ListCastMembersUseCase } from './list-cast-members.usecase';

describe('ListCastMembersUseCase Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  let useCase: ListCastMembersUseCase;
  let castMemberRepository: CastMemberSequelizeRepository;

  beforeEach(() => {
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should return a list of cast members', async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(2)
        .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
        .build();

      await castMemberRepository.bulkInsert(castMembers);

      const output = await useCase.execute({});
      expect(output).toEqual({
        items: castMembers.reverse().map(CastMemberOutputMapper.toDTO),
        total: 2,
        currentPage: 1,
        perPage: 15,
        lastPage: 1,
      });
    });
  });
});
