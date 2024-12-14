import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { DeleteCastMemberUseCase } from './delete-cast-member.usecase';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { InvalidUuidError } from '@core/shared/domain/value-object/value-objects/uuid.vo';

describe('DeleteCastMemberUsecase Unit Tests', () => {
  let useCase: DeleteCastMemberUseCase;
  let castMemberRepository: CastMemberInMemoryRepository;

  beforeEach(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
    useCase = new DeleteCastMemberUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should delete a cast member', async () => {
      const castMember = CastMember.create({
        name: 'any_name',
        type: CastMemberType.createADirector(),
      });

      await castMemberRepository.insert(castMember);

      await useCase.execute(castMember.castMemberId);

      const result = await castMemberRepository.findAll();

      expect(result).toHaveLength(0);
    });

    it('should throw an error if input is invalid', async () => {
      const input = {
        id: '2',
      };

      await expect(useCase.execute(input)).rejects.toThrow(InvalidUuidError);
    });
  });
});
