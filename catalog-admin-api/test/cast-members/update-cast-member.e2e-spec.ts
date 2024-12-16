import { CastMemberOutputMapper } from '@core/cast-member/application/@shared/cast-member-output';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { instanceToPlain } from 'class-transformer';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CastMembersController } from 'src/nest-modules/cast-members/controller/cast-members.controller';
import { UpdateCastMemberFixture } from 'src/nest-modules/cast-members/testing/cast-members.fixtures';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();

  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('PATCH /cast-members/:id', () => {
    describe('update a cast member with invalid input', () => {
      describe('should a response error when id is invalid', () => {
        const faker = CastMember.fake().anActor();
        const arrange = [
          {
            id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            sendData: { name: faker.name },
            expected: {
              message:
                'CastMember with id(s) 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
              statusCode: 404,
              error: 'Not Found',
            },
          },
          {
            id: 'fake id',
            sendData: { name: faker.name },
            expected: {
              statusCode: 422,
              message: 'Validation failed (uuid is expected)',
              error: 'Unprocessable Entity',
            },
          },
        ];

        test.each(arrange)(
          'when id is $id',
          async ({ id, sendData, expected }) => {
            return request(appHelper.app.getHttpServer())
              .patch(`/cast-members/${id}`)
              .send(sendData)
              .expect(expected.statusCode)
              .expect(expected);
          },
        );
      });

      describe('should a response error with 422 when body is invalid', () => {
        const app = startApp();
        const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
        const arrange = Object.keys(invalidRequest).map((key) => ({
          label: key,
          value: invalidRequest[key],
        }));
        test.each(arrange)('when body is $label', ({ value }) => {
          return request(app.app.getHttpServer())
            .patch(`/cast-members/${uuid}`)
            .send(value.sendData)
            .expect(422)
            .expect(value.expected);
        });
      });
    });

    describe('should a response error with 422 when body is invalid', () => {
      const app = startApp();
      const validationError =
        UpdateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationError).map((key) => ({
        label: key,
        value: validationError[key],
      }));
      let castMemberRepo: ICastMemberRepository;

      beforeEach(() => {
        castMemberRepo = app.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
      });
      test.each(arrange)('when body is $label', async ({ value }) => {
        const castMember = CastMember.fake().anActor().build();
        await castMemberRepo.insert(castMember);
        return request(app.app.getHttpServer())
          .patch(`/cast-members/${castMember.castMemberId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('update a cast member with valid input', () => {
      describe('should return a cast member', () => {
        const arrange = UpdateCastMemberFixture.arrangeForUpdate();
        let castMemberRepo: ICastMemberRepository;

        beforeEach(async () => {
          castMemberRepo = appHelper.app.get<ICastMemberRepository>(
            CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
          );
        });
        test.each(arrange)(
          'when body is $sendData',
          async ({ sendData, expected }) => {
            const castMemberCreated = CastMember.fake().anActor().build();
            await castMemberRepo.insert(castMemberCreated);

            const res = await request(appHelper.app.getHttpServer())
              .patch(`/cast-members/${castMemberCreated.castMemberId.id}`)
              .send(sendData)
              .expect(200);
            const keyInResponse = UpdateCastMemberFixture.keysInResponse;
            expect(Object.keys(res.body)).toStrictEqual(['data']);
            expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
            const id = res.body.data.id;
            const castMemberUpdated = await castMemberRepo.findById(
              new Uuid(id),
            );
            const presenter = CastMembersController.serialize(
              CastMemberOutputMapper.toDTO(castMemberUpdated),
            );
            const serialized = instanceToPlain(presenter);
            expect(res.body.data).toStrictEqual(serialized);
            expect(res.body.data).toStrictEqual({
              id: serialized.id,
              createdAt: serialized.createdAt,
              name: expected.name ?? castMemberCreated.name,
              type: expected.type ?? castMemberCreated.type.type,
            });
          },
        );
      });
    });
  });
});
