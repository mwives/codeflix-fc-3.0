import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { ListCastMembersUseCase } from './list-cast-members.usecase';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberOutputMapper } from '../@shared/cast-member-output';

describe('ListCastMembersUseCase Unit Tests', () => {
  let useCase: ListCastMembersUseCase;
  let castMemberRepository: CastMemberInMemoryRepository;

  beforeEach(() => {
    castMemberRepository = new CastMemberInMemoryRepository();
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

    it('should return a list of cast members with pagination', async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(20)
        .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
        .build();

      await castMemberRepository.bulkInsert(castMembers);

      const output = await useCase.execute({ page: 1, perPage: 10 });
      expect(output).toEqual({
        items: castMembers
          .reverse()
          .slice(0, 10)
          .map(CastMemberOutputMapper.toDTO),
        total: 20,
        currentPage: 1,
        perPage: 10,
        lastPage: 2,
      });
    });

    it('should return a list of cast members with sorting', async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(2)
        .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
        .build();

      await castMemberRepository.bulkInsert(castMembers);

      const output = await useCase.execute({
        sort: 'createdAt',
        sortDir: 'asc',
      });
      expect(output).toEqual({
        items: castMembers.map(CastMemberOutputMapper.toDTO),
        total: 2,
        currentPage: 1,
        perPage: 15,
        lastPage: 1,
      });
    });

    it('should return a list of cast members with filtering', async () => {
      const createdAt = new Date(new Date().getTime() + 1000);

      const castMembers = [
        CastMember.fake()
          .anActor()
          .withName('any_name')
          .withCreatedAt(createdAt)
          .build(),
        CastMember.fake()
          .anActor()
          .withName('another_name')
          .withCreatedAt(createdAt)
          .build(),
      ];

      await castMemberRepository.bulkInsert(castMembers);

      const output = await useCase.execute({ filter: { name: 'any_name' } });
      expect(output).toEqual({
        items: [castMembers[0]].map(CastMemberOutputMapper.toDTO),
        total: 1,
        currentPage: 1,
        perPage: 15,
        lastPage: 1,
      });
    });
  });
});
