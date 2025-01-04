import { CastMemberOutputMapper } from '@core/cast-member/application/usecases/common/cast-member-output';
import { CreateCastMemberUseCase } from '@core/cast-member/application/usecases/create-cast-member/create-cast-member.usecase';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/usecases/delete-cast-member/delete-cast-member.usecase';
import { GetCastMemberUseCase } from '@core/cast-member/application/usecases/get-cast-member/get-cast-member.usecase';
import { ListCastMembersUseCase } from '@core/cast-member/application/usecases/list-cast-members/list-cast-members.usecase';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/usecases/update-cast-member/update-cast-member.usecase';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from 'src/nest-modules/database-module/database.module';
import { CastMembersModule } from '../cast-members.module';
import { CastMemberCollectionPresenter } from '../cast-members.presenter';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members.providers';
import {
  CreateCastMemberFixture,
  ListCastMembersFixture,
  UpdateCastMemberFixture,
} from '../testing/cast-members.fixtures';
import { CastMembersController } from './cast-members.controller';

describe('CastMembersController Integration Tests', () => {
  let controller: CastMembersController;
  let repository: ICastMemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CastMembersModule],
    }).compile();

    controller = module.get(CastMembersController);
    repository = module.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createCastMemberUseCase']).toBeInstanceOf(
      CreateCastMemberUseCase,
    );
    expect(controller['updateCastMemberUseCase']).toBeInstanceOf(
      UpdateCastMemberUseCase,
    );
    expect(controller['listCastMembersUseCase']).toBeInstanceOf(
      ListCastMembersUseCase,
    );
    expect(controller['getCastMemberUseCase']).toBeInstanceOf(
      GetCastMemberUseCase,
    );
    expect(controller['deleteCastMemberUseCase']).toBeInstanceOf(
      DeleteCastMemberUseCase,
    );
  });

  describe('create', () => {
    const arrange = CreateCastMemberFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is $sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.create(sendData);
        const entity = await repository.findById(new Uuid(presenter.id));

        expect(entity.toJSON()).toStrictEqual({
          castMemberId: presenter.id,
          createdAt: presenter.createdAt,
          ...expected,
        });

        expect(presenter).toEqual(
          CastMembersController.serialize(CastMemberOutputMapper.toDTO(entity)),
        );
      },
    );
  });

  describe('update', () => {
    const arrange = UpdateCastMemberFixture.arrangeForUpdate();

    const castMember = CastMember.fake().anActor().build();
    beforeEach(async () => {
      await repository.insert(castMember);
    });

    describe('findById', () => {
      test.each(arrange)(
        'with request $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.update(
            castMember.castMemberId.id,
            sendData,
          );
          const entity = await repository.findById(new Uuid(presenter.id));

          expect(entity.toJSON()).toStrictEqual({
            castMemberId: presenter.id,
            createdAt: presenter.createdAt,
            name: expected.name ?? castMember.name,
            type: expected.type ?? castMember.type.type,
          });
          expect(presenter).toEqual(
            CastMembersController.serialize(
              CastMemberOutputMapper.toDTO(entity),
            ),
          );
        },
      );
    });
  });

  describe('remove', () => {
    it('should remove a cast member', async () => {
      const castMember = CastMember.fake().anActor().build();
      await repository.insert(castMember);
      const response = await controller.remove(castMember.castMemberId.id);
      expect(response).not.toBeDefined();
      await expect(
        repository.findById(castMember.castMemberId),
      ).resolves.toBeNull();
    });
  });

  describe('findOne', () => {
    it('should get a cast member', async () => {
      const castMember = CastMember.fake().anActor().build();
      await repository.insert(castMember);

      const presenter = await controller.findOne(castMember.castMemberId.id);

      expect(presenter.id).toBe(castMember.castMemberId.id);
      expect(presenter.name).toBe(castMember.name);
      expect(presenter.type).toBe(castMember.type.type);
      expect(presenter.createdAt).toEqual(castMember.createdAt);
    });
  });

  describe('search', () => {
    describe('should return cast members using query empty ordered by createdAt', () => {
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CastMemberCollectionPresenter({
              items: entities.map(CastMemberOutputMapper.toDTO),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('search', () => {
      describe('should return cast members using query empty ordered by name', () => {
        const { entitiesMap, arrange } =
          ListCastMembersFixture.arrangeUnsorted();

        beforeEach(async () => {
          await repository.bulkInsert(Object.values(entitiesMap));
        });

        test.each(arrange)(
          'when sendData is $sendData',
          async ({ sendData, expected }) => {
            const presenter = await controller.search(sendData);
            const { entities, ...paginationProps } = expected;
            expect(presenter).toEqual(
              new CastMemberCollectionPresenter({
                items: entities.map(CastMemberOutputMapper.toDTO),
                ...paginationProps.meta,
              }),
            );
          },
        );
      });
    });
  });
});
