import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '@core/cast-member/domain/repository/cast-member.repository';
import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberSequelizeRepository } from './cast-member-sequelize.repository';
import { CastMemberModel } from './cast-member.model';

describe('CastMemberSequelizeRepository', () => {
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  async function createCastMember() {
    const castMember = CastMember.fake().aDirector().build();
    await CastMemberModel.create({
      castMemberId: castMember.castMemberId.id,
      name: castMember.name,
      type: castMember.type.type,
      createdAt: castMember.createdAt,
    });
    return castMember;
  }

  describe('insert', () => {
    it('should insert a cast member', async () => {
      const castMember = CastMember.fake().aDirector().build();

      await repository.insert(castMember);

      const castMemberInserted = await CastMemberModel.findByPk(
        castMember.castMemberId.id,
      );
      expect(castMemberInserted.toJSON()).toMatchObject({
        castMemberId: castMember.castMemberId.id,
        name: castMember.name,
        type: castMember.type.type,
        createdAt: castMember.createdAt,
      });
    });
  });

  describe('bulkInsert', () => {
    it('should insert multiple cast members', async () => {
      const castMembers = [
        CastMember.fake().aDirector().build(),
        CastMember.fake().anActor().build(),
      ];

      await repository.bulkInsert(castMembers);

      const castMembersInserted = await CastMemberModel.findAll();
      expect(castMembersInserted).toHaveLength(2);
      expect(castMembersInserted[0].castMemberId).toBe(
        castMembers[0].castMemberId.id,
      );
      expect(castMembersInserted[1].castMemberId).toBe(
        castMembers[1].castMemberId.id,
      );
    });
  });

  describe('findById', () => {
    it('should return a cast member', async () => {
      const castMember = await createCastMember();

      const result = await repository.findById(castMember.castMemberId);

      expect(result.toJSON()).toMatchObject(castMember.toJSON());
    });

    it('should return null if the cast member does not exist', async () => {
      const result = await repository.findById(new CastMemberId());
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all cast members', async () => {
      const castMembers = [
        CastMember.fake().aDirector().build(),
        CastMember.fake().anActor().build(),
      ];
      await CastMemberModel.bulkCreate(castMembers.map((c) => c.toJSON()));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        castMemberId: castMembers[0].castMemberId,
        name: castMembers[0].name,
        type: castMembers[0].type,
        createdAt: castMembers[0].createdAt,
      });
      expect(result[1]).toMatchObject({
        castMemberId: castMembers[1].castMemberId,
        name: castMembers[1].name,
        type: castMembers[1].type,
        createdAt: castMembers[1].createdAt,
      });
    });
  });

  describe('findByIds', () => {
    it('should return cast members by ids', async () => {
      const castMembers = CastMember.fake().theCastMembers(2).build();

      await CastMemberModel.bulkCreate(castMembers.map((c) => c.toJSON()));

      const result = await repository.findByIds(
        castMembers.map((c) => c.castMemberId),
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('existsById', () => {
    it('should return existing cast members', async () => {
      const castMembers = [
        CastMember.fake().aDirector().build(),
        CastMember.fake().anActor().build(),
      ];
      await CastMemberModel.bulkCreate(castMembers.map((c) => c.toJSON()));

      const result = await repository.existsById(
        castMembers.map((c) => c.castMemberId),
      );

      expect(result.exists).toHaveLength(2);
      expect(result.notExists).toHaveLength(0);
    });

    it('should return not existing cast members', async () => {
      const castMembers = [
        CastMember.fake().aDirector().build(),
        CastMember.fake().anActor().build(),
      ];

      const result = await repository.existsById(
        castMembers.map((c) => c.castMemberId),
      );

      expect(result.exists).toHaveLength(0);
      expect(result.notExists).toHaveLength(2);
    });

    it('should throw InvalidArgumentError if ids is an empty array', async () => {
      await expect(repository.existsById([])).rejects.toThrow(
        InvalidArgumentError,
      );
    });
  });

  describe('update', () => {
    it('should update a cast member', async () => {
      const castMember = await createCastMember();
      castMember.changeName('new_name');

      await repository.update(castMember);

      const castMemberUpdated = await CastMemberModel.findByPk(
        castMember.castMemberId.id,
      );
      expect(castMemberUpdated.name).toBe('new_name');
    });

    it('should throw an error if the cast member does not exist', async () => {
      const castMember = CastMember.fake().aDirector().build();

      await expect(repository.update(castMember)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should delete a cast member', async () => {
      const castMember = await createCastMember();

      await repository.delete(castMember.castMemberId);

      const castMemberDeleted = await CastMemberModel.findByPk(
        castMember.castMemberId.id,
      );
      expect(castMemberDeleted).toBeNull();
    });

    it('should throw an error if the cast member does not exist', async () => {
      const castMemberId = new CastMemberId();

      await expect(repository.delete(castMemberId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('search', () => {
    it('should return cast members by search params', async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .build();

      await CastMemberModel.bulkCreate(castMembers.map((c) => c.toJSON()));

      const result = await repository.search(CastMemberSearchParams.create());

      expect(result).toBeInstanceOf(CastMemberSearchResult);
      expect(result.items).toHaveLength(15);
      expect(result.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
    });

    it('should return cast members by search params with filter', async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(2)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .build();

      await CastMemberModel.bulkCreate(castMembers.map((c) => c.toJSON()));

      const result = await repository.search(
        CastMemberSearchParams.create({
          filter: { name: castMembers[0].name, type: castMembers[0].type.type },
        }),
      );

      expect(result.items).toHaveLength(1);
    });

    it('should return cast members by search params with sort', async () => {
      const castMembers = CastMember.fake()
        .theCastMembers(2)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .build();

      await CastMemberModel.bulkCreate(castMembers.map((c) => c.toJSON()));

      const result = await repository.search(
        CastMemberSearchParams.create({
          sort: 'name',
          sortDir: 'asc',
        }),
      );

      const castMembersSorted = castMembers.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      expect(result.items[0].name).toBe(castMembersSorted[0].name);
      expect(result.items[1].name).toBe(castMembersSorted[1].name);
    });
  });
});
