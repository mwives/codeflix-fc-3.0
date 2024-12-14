import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/entity/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { UpdateCastMemberUseCase } from './update-cast-member.usecase';

describe('UpdateCastMemberUsecase', () => {
  setupSequelize({ models: [CastMemberModel] });

  let useCase: UpdateCastMemberUseCase;
  let castMemberRepository: CastMemberSequelizeRepository;

  beforeAll(() => {
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should update a cast member', async () => {
      const castMember = CastMember.create({
        name: 'any_name',
        type: CastMemberType.createADirector(),
      });

      await castMemberRepository.insert(castMember);

      const result = await useCase.execute({
        id: castMember.castMemberId.id,
        name: 'new_name',
        type: CastMemberType.createADirector().type,
      });

      expect(result).toEqual({
        id: castMember.castMemberId.id,
        name: 'new_name',
        type: CastMemberTypes.DIRECTOR,
        createdAt: castMember.createdAt,
      });
    });
  });
});
