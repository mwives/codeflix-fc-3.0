import { CastMembersStorageValidator } from '@core/cast-member/application/validations/cast-member-storage.validator';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenresIdStorageValidator } from '@core/genre/application/validations/genre-id-storage.validator';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { ApplicationService } from '@core/shared/application/application.service';
import { IStorage } from '@core/shared/application/storage.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CreateVideoUseCase } from '@core/video/application/usecases/create-video/create-video.usecase';
import { GetVideoUseCase } from '@core/video/application/usecases/get-video/get-video.usecase';
import { ProcessAudioVideoMediasUseCase } from '@core/video/application/usecases/process-audio-video-medias/process-audio-video-medias.usecase';
import { UpdateVideoUseCase } from '@core/video/application/usecases/update-video/update-video.usecase';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-medias.usecase';
import { IVideoRepository } from '@core/video/domain/repository/video.repository';
import { VideoInMemoryRepository } from '@core/video/infra/db/in-memory/video-in-memory.repository';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { getModelToken } from '@nestjs/sequelize';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members/cast-members.providers';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { GENRES_PROVIDERS } from '../genres-module/genres.provider';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoryIdStorageValidator,
      genresIdValidator: GenresIdStorageValidator,
      castMembersIdValidator: CastMembersStorageValidator,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_ID_STORAGE_VALIDATOR.provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS.CAST_MEMBERS_STORAGE_VALIDATOR.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoryIdStorageValidator,
      genresIdValidator: GenresIdStorageValidator,
      castMembersIdValidator: CastMembersStorageValidator,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_ID_STORAGE_VALIDATOR.provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS.CAST_MEMBERS_STORAGE_VALIDATOR.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadAudioVideoMediasUseCase(appService, videoRepo, storage);
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  COMPLETE_PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: ProcessAudioVideoMediasUseCase,
    useFactory: (uow: IUnitOfWork, videoRepo: IVideoRepository) => {
      return new ProcessAudioVideoMediasUseCase(uow, videoRepo);
    },
    inject: ['IUnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
