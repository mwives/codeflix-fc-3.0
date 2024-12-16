import { CastMemberOutputMapper } from '@core/cast-member/application/@shared/cast-member-output';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CastMembersController } from 'src/nest-modules/cast-members/controller/cast-members.controller';
import { GetCastMemberFixture } from 'src/nest-modules/cast-members/testing/cast-members.fixtures';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();

  describe('GET /cast-members/:id', () => {
    describe('get a cast member with valid input', () => {
      it('should return a cast member', async () => {
        const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        const castMember = CastMember.fake().anActor().build();
        await castMemberRepo.insert(castMember);

        const res = await request(appHelper.app.getHttpServer())
          .get(`/cast-members/${castMember.castMemberId.id}`)
          .expect(200);
        const keyInResponse = GetCastMemberFixture.keysInResponse;
        expect(Object.keys(res.body)).toStrictEqual(['data']);
        expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

        const presenter = CastMembersController.serialize(
          CastMemberOutputMapper.toDTO(castMember),
        );
        const serialized = instanceToPlain(presenter);
        expect(res.body.data).toStrictEqual(serialized);
      });
    });

    describe('get a cast member with invalid input', () => {
      const uuid = '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a';
      const arrange = [
        {
          id: uuid,
          expected: {
            message: `CastMember with id(s) ${uuid} not found`,
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });
  });
});
