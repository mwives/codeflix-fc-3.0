import { CreateCastMemberUseCase } from '@core/cast-member/application/usecases/create-cast-member/create-cast-member.usecase';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/usecases/delete-cast-member/delete-cast-member.usecase';
import { GetCastMemberUseCase } from '@core/cast-member/application/usecases/get-cast-member/get-cast-member.usecase';
import { ListCastMembersUseCase } from '@core/cast-member/application/usecases/list-cast-members/list-cast-members.usecase';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/usecases/update-cast-member/update-cast-member.usecase';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { getModelToken } from '@nestjs/sequelize';

export const REPOSITORIES = {
  CAST_MEMBER_REPOSITORY: {
    provide: 'CastMemberRepository',
    useExisting: CastMemberSequelizeRepository,
  },
  CAST_MEMBER_IN_MEMORY_REPOSITORY: {
    provide: CastMemberInMemoryRepository,
    useClass: CastMemberInMemoryRepository,
  },
  CAST_MEMBER_SEQUELIZE_REPOSITORY: {
    provide: CastMemberSequelizeRepository,
    useFactory: (castMemberModel: typeof CastMemberModel) => {
      return new CastMemberSequelizeRepository(castMemberModel);
    },
    inject: [getModelToken(CastMemberModel)],
  },
};

export const USE_CASES = {
  CREATE_CAST_MEMBER_USE_CASE: {
    provide: CreateCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new CreateCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  UPDATE_CAST_MEMBER_USE_CASE: {
    provide: UpdateCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new UpdateCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  LIST_CAST_MEMBERS_USE_CASE: {
    provide: ListCastMembersUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new ListCastMembersUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  GET_CAST_MEMBER_USE_CASE: {
    provide: GetCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new GetCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
  DELETE_CAST_MEMBER_USE_CASE: {
    provide: DeleteCastMemberUseCase,
    useFactory: (castMemberRepo: ICastMemberRepository) => {
      return new DeleteCastMemberUseCase(castMemberRepo);
    },
    inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY.provide],
  },
};

export const CAST_MEMBERS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
