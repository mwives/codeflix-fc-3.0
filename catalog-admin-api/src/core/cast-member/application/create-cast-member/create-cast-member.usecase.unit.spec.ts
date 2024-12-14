import { InvalidCastMemberTypeError } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CreateCastMemberInput } from './create-cast-member.input';
import { CreateCastMemberUseCase } from './create-cast-member.usecase';

describe('CreateCastMemberUseCase Unit Tests', () => {
  let useCase: CreateCastMemberUseCase;
  let castMemberRepository: CastMemberInMemoryRepository;

  beforeEach(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(castMemberRepository);
  });

  describe('execute', () => {
    it('should create a cast member', async () => {
      const input: CreateCastMemberInput = {
        name: 'any_name',
        type: 1,
      };

      const output = await useCase.execute(input);

      expect(output).toEqual({
        id: expect.any(String),
        name: input.name,
        type: input.type,
        createdAt: expect.any(Date),
      });
    });
  });

  it('should throw an error if input is invalid', async () => {
    const input: CreateCastMemberInput = {
      name: '',
      type: 3 as any,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      InvalidCastMemberTypeError,
    );
  });
});
