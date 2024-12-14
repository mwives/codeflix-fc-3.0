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

describe('GetCastMember Unit Tests', () => {
  let getCastMemberUseCase: GetCastMemberUseCase;
  let castMemberRepository: CastMemberInMemoryRepository;

  beforeAll(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
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

    it('should throw an error if input is invalid', async () => {
      const input = {
        id: '2',
      };

      await expect(getCastMemberUseCase.execute(input)).rejects.toThrow(
        InvalidUuidError,
      );
    });

    it('should throw an error if cast member does not exist', async () => {
      const input = {
        id: new CastMemberId().id,
      };

      await expect(getCastMemberUseCase.execute(input)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
