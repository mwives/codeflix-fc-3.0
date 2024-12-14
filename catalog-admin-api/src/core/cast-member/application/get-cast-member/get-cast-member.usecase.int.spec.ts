import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { GetCastMemberUseCase } from './get-cast-member.usecase';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { CastMemberOutputMapper } from '../@shared/cast-member-output';
import { InvalidUuidError } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';

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
