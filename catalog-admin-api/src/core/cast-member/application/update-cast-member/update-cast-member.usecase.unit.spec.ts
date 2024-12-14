import {
  CastMemberType,
  InvalidCastMemberTypeError,
} from '@core/cast-member/domain/entity/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { InvalidUuidError } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { CastMemberOutputMapper } from '../@shared/cast-member-output';
import { UpdateCastMemberUseCase } from './update-cast-member.usecase';

describe('UpdateCastMemberUsecase', () => {
  let useCase: UpdateCastMemberUseCase;
  let castMemberRepository: CastMemberInMemoryRepository;

  beforeAll(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should update a cast member', async () => {
      const castMember = CastMember.create({
        name: 'any_name',
        type: CastMemberType.createADirector(),
      });

      const changeNameSpy = jest.spyOn(castMember, 'changeName');
      const changeTypeSpy = jest.spyOn(castMember, 'changeType');

      await castMemberRepository.insert(castMember);

      const result = await useCase.execute({
        id: castMember.castMemberId.id,
        name: 'new_name',
        type: CastMemberType.createAnActor().type,
      });

      expect(result).toEqual(CastMemberOutputMapper.toDTO(castMember));
      expect(changeNameSpy).toHaveBeenCalledWith('new_name');
      expect(changeTypeSpy).toHaveBeenCalledWith(
        CastMemberType.createAnActor(),
      );
    });

    it('should throw an error if cast member does not exist', async () => {
      const input = {
        id: new CastMemberId().id,
        name: 'new_name',
        type: CastMemberType.createAnActor().type,
      };

      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    });

    it('should throw an error if cast member id is invalid', async () => {
      const input = {
        id: '2',
        name: 'new_name',
        type: CastMemberType.createAnActor().type,
      };

      await expect(useCase.execute(input)).rejects.toThrow(InvalidUuidError);
    });

    it('should throw and error if type is invalid', async () => {
      const castMember = CastMember.create({
        name: 'any_name',
        type: CastMemberType.createADirector(),
      });

      await castMemberRepository.insert(castMember);

      const input = {
        id: castMember.castMemberId.id,
        name: 'new_name',
        type: 3,
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        InvalidCastMemberTypeError,
      );
    });
  });
});
