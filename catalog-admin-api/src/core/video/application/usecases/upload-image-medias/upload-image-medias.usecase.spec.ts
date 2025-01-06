import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { InMemoryStorage } from '@core/shared/infra/storage/in-memory.storage';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { IVideoRepository } from '@core/video/domain/repository/video.repository';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { UploadImageMediasInput } from './upload-image-medias.input';
import { UploadImageMediasUseCase } from './upload-image-medias.usecase';

describe('UploadImageMediasUseCase Integration Tests', () => {
  let uploadImageMediasUseCase: UploadImageMediasUseCase;
  let videoRepository: IVideoRepository;
  let categoryRepository: ICategoryRepository;
  let genreRepository: IGenreRepository;
  let castMemberRepository: ICastMemberRepository;
  let uow: UnitOfWorkSequelize;
  let storageService: InMemoryStorage;
  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    storageService = new InMemoryStorage();

    uploadImageMediasUseCase = new UploadImageMediasUseCase(
      uow,
      videoRepository,
      storageService,
    );
  });

  describe('execute', () => {
    it('should throw an error when video does not exist', async () => {
      const input: UploadImageMediasInput = {
        videoId: new VideoId().id,
        field: 'banner',
        file: {
          rawName: 'banner.png',
          data: Buffer.from(''),
          mimeType: 'image/png',
          size: 0,
        },
      };

      await expect(uploadImageMediasUseCase.execute(input)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw EntityValidationError when image is invalid', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepository.insert(castMember);

      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await videoRepository.insert(video);

      try {
        await uploadImageMediasUseCase.execute({
          videoId: video.videoId.id,
          field: 'banner',
          file: {
            rawName: 'banner.jpg',
            data: Buffer.from(''),
            mimeType: 'image/jpg',
            size: 100,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.errors).toEqual([
          {
            banner: [
              'Invalid media file mime type: image/jpg is not one of the valid mime types: image/jpeg, image/png, image/gif',
            ],
          },
        ]);
      }
    });

    it('should upload a banner image', async () => {
      const storeSpy = jest.spyOn(storageService, 'store');

      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepository.insert(castMember);

      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await videoRepository.insert(video);

      await uploadImageMediasUseCase.execute({
        videoId: video.videoId.id,
        field: 'banner',
        file: {
          rawName: 'banner.jpg',
          data: Buffer.from(''),
          mimeType: 'image/jpeg',
          size: 100,
        },
      });

      const updatedVideo = await videoRepository.findById(video.videoId);

      expect(storeSpy).toHaveBeenCalledWith({
        data: Buffer.from(''),
        mimeType: 'image/jpeg',

        id: updatedVideo.banner.url,
      });
      expect(updatedVideo.banner).toBeDefined();
      expect(updatedVideo.banner.url).toBeDefined();
      expect(updatedVideo.banner.name).toMatch(/^.+\.jpg$/);
      expect(updatedVideo.banner.location).toBe(
        `videos/${updatedVideo.videoId.id}/images`,
      );
    });
  });
});
