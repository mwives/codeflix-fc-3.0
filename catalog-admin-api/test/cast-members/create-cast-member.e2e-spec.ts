import { CastMemberOutputMapper } from '@core/cast-member/application/usecases/common/cast-member-output';
import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CastMembersController } from 'src/nest-modules/cast-members/controller/cast-members.controller';
import { CreateCastMemberFixture } from 'src/nest-modules/cast-members/testing/cast-members.fixtures';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();
  let castMemberRepository: ICastMemberRepository;

  beforeEach(async () => {
    castMemberRepository = appHelper.app.get<ICastMemberRepository>(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('POST /cast-members', () => {
    describe('create a cast member with valid input', () => {
      const arrange = CreateCastMemberFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/cast-members')
            .send(sendData)
            .expect(201);

          const keyInResponse = CreateCastMemberFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const castMemberCreated = await castMemberRepository.findById(
            new CastMemberId(id),
          );
          const presenter = CastMembersController.serialize(
            CastMemberOutputMapper.toDTO(castMemberCreated),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });

    describe('create a cast member with invalid input', () => {
      const castMemberValidationError =
        CreateCastMemberFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(castMemberValidationError).map((key) => ({
        label: key,
        value: castMemberValidationError[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should return 422 when body is invalid', () => {
      const invalidCastMemberRequest =
        CreateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidCastMemberRequest).map((key) => ({
        label: key,
        value: invalidCastMemberRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/cast-members')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });
  });
});
