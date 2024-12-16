import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();

  describe('DELETE /cast-members/:id', () => {
    describe('delete a cast member with invalid input', () => {
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
          .delete(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('delete a cast member with valid input', () => {
      it('should delete a cast member', async () => {
        const castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        const castMember = CastMember.fake().anActor().build();
        await castMemberRepo.insert(castMember);

        await request(appHelper.app.getHttpServer())
          .delete(`/cast-members/${castMember.castMemberId.id}`)
          .expect(204);

        await expect(
          castMemberRepo.findById(castMember.castMemberId),
        ).resolves.toBeNull();
      });
    });
  });
});
