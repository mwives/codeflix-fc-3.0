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
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { VideoId } from '@core/video/domain/entity/video.entity';
import { RatingValues } from '@core/video/domain/entity/vo/rating.vo';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { CreateVideoUseCase } from './create-video.usecase';

describe('CreateVideoUseCase', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateVideoUseCase;

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
    useCase = new CreateVideoUseCase(
      uow,
      videoRepo,
      categoriesIdsValidator,
      genresIdsValidator,
      castMembersIdsValidator,
    );
  });

  describe('execute', () => {
    it('should create a video', async () => {
      const categories = Category.fake().theCategories(2).build();
      await categoryRepo.bulkInsert(categories);
      const categoryIds = categories.map((c) => c.categoryId.id);

      const genres = Genre.fake().theGenres(2).build();
      genres[0].syncCategoryIds([categories[0].categoryId]);
      genres[1].syncCategoryIds([categories[1].categoryId]);
      await genreRepo.bulkInsert(genres);
      const genreIds = genres.map((c) => c.genreId.id);

      const castMembers = CastMember.fake().theCastMembers(2).build();
      await castMemberRepo.bulkInsert(castMembers);
      const castMemberIds = castMembers.map((c) => c.castMemberId.id);

      const output = await useCase.execute({
        title: 'test video',
        description: 'test description',
        releaseYear: 2021,
        duration: 90,
        rating: RatingValues.R10,
        isNewRelease: true,
        categoryIds,
        genreIds,
        castMemberIds,
      });

      expect(output).toStrictEqual({
        id: expect.any(String),
      });

      const video = await videoRepo.findById(new VideoId(output.id));

      expect(video!.toJSON()).toStrictEqual({
        videoId: expect.any(String),
        title: 'test video',
        description: 'test description',
        releaseYear: 2021,
        duration: 90,
        rating: RatingValues.R10,
        isNewRelease: true,
        isPublished: false,
        banner: undefined,
        thumbnail: undefined,
        thumbnailHalf: undefined,
        trailer: undefined,
        video: undefined,
        categoryIds: expect.arrayContaining(categoryIds),
        genreIds: expect.arrayContaining(genreIds),
        castMemberIds: expect.arrayContaining(castMemberIds),
        createdAt: expect.any(Date),
      });
    });
  });
});
