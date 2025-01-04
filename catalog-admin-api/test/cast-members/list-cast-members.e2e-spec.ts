import { CastMemberOutputMapper } from '@core/cast-member/application/usecases/common/cast-member-output';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import qs from 'qs';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { CastMembersController } from 'src/nest-modules/cast-members/controller/cast-members.controller';
import { ListCastMembersFixture } from 'src/nest-modules/cast-members/testing/cast-members.fixtures';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  describe('GET /cast-members', () => {
    const appHelper = startApp();

    describe('list cast members with valid input', () => {
      describe('should return cast members using paginate', () => {
        let castMemberRepository: ICastMemberRepository;
        const { entitiesMap, arrange } =
          ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

        beforeEach(async () => {
          castMemberRepository = appHelper.app.get<ICastMemberRepository>(
            CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
          );
          await castMemberRepository.bulkInsert(Object.values(entitiesMap));
        });

        test.each(arrange)(
          'when query params is $sendData',
          async ({ sendData, expected }) => {
            const queryParams = new URLSearchParams(sendData as any).toString();
            return request(appHelper.app.getHttpServer())
              .get(`/cast-members/?${queryParams}`)
              .expect(200)
              .expect({
                data: expected.entities.map((e) =>
                  instanceToPlain(
                    CastMembersController.serialize(
                      CastMemberOutputMapper.toDTO(e),
                    ),
                  ),
                ),
                meta: expected.meta,
              });
          },
        );
      });

      describe('should return cast members using sort', () => {
        let castMemberRepo: ICastMemberRepository;
        const nestApp = startApp();
        const { entitiesMap, arrange } =
          ListCastMembersFixture.arrangeUnsorted();

        beforeEach(async () => {
          castMemberRepo = nestApp.app.get<ICastMemberRepository>(
            CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
          );
          await castMemberRepo.bulkInsert(Object.values(entitiesMap));
        });

        test.each([arrange[0]])(
          'when query params is $sendData',
          async ({ sendData, expected }) => {
            const queryParams = qs.stringify(sendData as any);
            return request(nestApp.app.getHttpServer())
              .get(`/cast-members/?${queryParams}`)
              .expect(200)
              .expect({
                data: expected.entities.map((e) =>
                  instanceToPlain(
                    CastMembersController.serialize(
                      CastMemberOutputMapper.toDTO(e),
                    ),
                  ),
                ),
                meta: expected.meta,
              });
          },
        );
      });
    });
  });
});
