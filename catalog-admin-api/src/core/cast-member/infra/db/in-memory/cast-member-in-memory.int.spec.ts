import {
  CastMemberType,
  CastMemberTypes,
} from '@core/cast-member/domain/entity/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberInMemoryRepository } from './cast-member-in-memory.repository';

describe('CastMemberInMemoryRepository', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
  });

  const mockData: CastMember[] = [
    new CastMember({
      castMemberId: new CastMemberId(),
      name: 'John Doe',
      type: CastMemberType.createADirector(),
      createdAt: new Date('2023-01-01'),
    }),
    new CastMember({
      castMemberId: new CastMemberId(),
      name: 'Jane Smith',
      type: CastMemberType.createADirector(),
      createdAt: new Date('2023-02-01'),
    }),
    new CastMember({
      castMemberId: new CastMemberId(),
      name: 'Alice Johnson',
      type: CastMemberType.createAnActor(),
      createdAt: new Date('2023-03-01'),
    }),
  ];

  describe('applyFilter', () => {
    it('should return all items if no filter is provided', async () => {
      const result = await repository['applyFilter'](mockData, null);
      expect(result).toHaveLength(3);
    });

    it('should filter by name', async () => {
      const result = await repository['applyFilter'](mockData, {
        name: 'john',
      });
      expect(result).toHaveLength(2);
      expect(result.map((item) => item.name)).toEqual(
        expect.arrayContaining(['John Doe', 'Alice Johnson']),
      );
    });

    it('should filter by type', async () => {
      const result = await repository['applyFilter'](mockData, {
        type: CastMemberType.createAnActor(),
      });
      expect(result).toHaveLength(1);
      expect(result.map((item) => item.type.type)).toEqual(
        expect.arrayContaining([CastMemberTypes.ACTOR]),
      );
    });

    it('should filter by name and type', async () => {
      const result = await repository['applyFilter'](mockData, {
        name: 'Alice',
        type: CastMemberType.createAnActor(),
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Johnson');
    });
  });

  describe('applySort', () => {
    it('should sort by createdAt descending by default', () => {
      const result = repository['applySort'](mockData, null, null);
      expect(result.map((item) => item.createdAt)).toEqual([
        new Date('2023-03-01'),
        new Date('2023-02-01'),
        new Date('2023-01-01'),
      ]);
    });

    it('should sort by name ascending', () => {
      const result = repository['applySort'](mockData, 'name', 'asc');
      expect(result.map((item) => item.name)).toEqual([
        'Alice Johnson',
        'Jane Smith',
        'John Doe',
      ]);
    });

    it('should sort by name descending', () => {
      const result = repository['applySort'](mockData, 'name', 'desc');
      expect(result.map((item) => item.name)).toEqual([
        'John Doe',
        'Jane Smith',
        'Alice Johnson',
      ]);
    });
  });
});
