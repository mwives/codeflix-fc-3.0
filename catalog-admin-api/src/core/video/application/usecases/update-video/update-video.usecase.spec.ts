import { CastMembersStorageValidator } from '@core/cast-member/application/validations/cast-member-storage.validator';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { Category } from '@core/category/domain/entity/category.entity';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenresIdStorageValidator } from '@core/genre/application/validations/genre-id-storage.validator';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { RatingValues } from '@core/video/domain/entity/vo/rating.vo';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { UpdateVideoInput } from './update-video.input';
import { UpdateVideoUseCase } from './update-video.usecase';

describe('UpdateVideoUsecase', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: UpdateVideoUseCase;

  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  let categoriesIdsValidator: CategoryIdStorageValidator;
  let genresIdsValidator: GenresIdStorageValidator;
  let castMembersIdsValidator: CastMembersStorageValidator;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    categoriesIdsValidator = new CategoryIdStorageValidator(categoryRepo);
    genresIdsValidator = new GenresIdStorageValidator(genreRepo);
    castMembersIdsValidator = new CastMembersStorageValidator(castMemberRepo);
    useCase = new UpdateVideoUseCase(
      uow,
      videoRepo,
      categoriesIdsValidator,
      genresIdsValidator,
      castMembersIdsValidator,
    );
  });

  describe('execute', () => {
    it('should update a video', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.insert(genre);

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepo.insert(castMember);

      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await videoRepo.insert(video);

      const input: UpdateVideoInput = {
        id: video.videoId.id,
        title: 'test video',
        description: 'test description',
        releaseYear: 2021,
        duration: 90,
        rating: RatingValues.R10,
        isNewRelease: true,
        categoryIds: [category.categoryId.id],
        genreIds: [genre.genreId.id],
        castMemberIds: [castMember.castMemberId.id],
      };

      const output = await useCase.execute(input);

      const updatedVideo = await videoRepo.findById(video.videoId);

      expect(output.id).toBe(updatedVideo.videoId.id);
    });

    it('should throw an error when video is not found', async () => {
      await expect(
        useCase.execute({
          id: new VideoId().id,
          releaseYear: 2021,
          duration: 90,
          rating: RatingValues.R10,
          isNewRelease: true,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
