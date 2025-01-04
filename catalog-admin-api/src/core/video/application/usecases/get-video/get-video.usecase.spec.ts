import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { VideoSequelizeRepository } from '@core/video/infra/db/sequelize/video-sequelize.repository';
import { GetVideoUseCase } from './get-video.usecase';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { setupSequelizeForVideo } from '@core/video/infra/db/sequelize/testing/helpers';
import { VideoModel } from '@core/video/infra/db/sequelize/video.model';
import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

describe('GetVideoUseCase', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetVideoUseCase;

  let videoRepo: VideoSequelizeRepository;
  let genreRepo: GenreSequelizeRepository;
  let castMemberRepo: CastMemberSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepo = new VideoSequelizeRepository(VideoModel, uow);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new GetVideoUseCase(
      videoRepo,
      categoryRepo,
      genreRepo,
      castMemberRepo,
    );
  });

  describe('execute', () => {
    it('should get a video', async () => {
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

      const output = await useCase.execute({ id: video.videoId.id });

      expect(output.id).toBe(video.videoId.id);
    });

    it('should throw an error when video is not found', async () => {
      await expect(useCase.execute({ id: new VideoId().id })).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
