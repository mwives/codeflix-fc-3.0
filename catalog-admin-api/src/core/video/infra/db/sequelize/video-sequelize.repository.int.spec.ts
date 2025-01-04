import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelizeForVideo } from './testing/helpers';
import { VideoSequelizeRepository } from './video-sequelize.repository';
import { VideoModel } from './video.model';
import { Category } from '@core/category/domain/entity/category.entity';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { VideoSearchParams } from '@core/video/domain/repository/video.repository';

describe('VideoSequelizeRepository Integration Tests', () => {
  const sequelizeHelper = setupSequelizeForVideo();

  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;
  let uow: UnitOfWorkSequelize;

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  describe('insert', () => {
    it('should insert a video', async () => {
      const { category, genre, castMember } = await createRelations();

      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepository.insert(video);

      const newVideo = await videoRepository.findById(video.videoId);

      expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
    });

    it('should insert a video with medias', async () => {
      const { category, genre, castMember } = await createRelations();

      const video = Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepository.insert(video);

      const newVideo = await videoRepository.findById(video.videoId);

      expect(newVideo!.toJSON()).toStrictEqual(video.toJSON());
    });
  });

  describe('bulkInsert', () => {
    it('should insert multiple videos', async () => {
      const { category, genre, castMember } = await createRelations();

      const videos = Video.fake()
        .theVideosWithoutMedias(2)
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepository.bulkInsert(videos);

      const newVideos = await videoRepository.findAll();

      expect(newVideos.length).toBe(2);
      expect(newVideos[0].toJSON()).toStrictEqual(videos[0].toJSON());
      expect(newVideos[1].toJSON()).toStrictEqual(videos[1].toJSON());
    });
  });

  describe('findByIds', () => {
    it('should find videos by ids', async () => {
      const { category, genre, castMember } = await createRelations();

      const videos = Video.fake()
        .theVideosWithoutMedias(2)
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepository.bulkInsert(videos);

      const newVideos = await videoRepository.findByIds(
        videos.map((v) => v.videoId),
      );

      expect(newVideos.length).toBe(2);
      expect(newVideos.map((video) => video.toJSON())).toEqual(
        expect.arrayContaining(videos.map((video) => video.toJSON())),
      );
    });
  });

  describe('existsById', () => {
    it('should return true if video exists', async () => {
      const { category, genre, castMember } = await createRelations();

      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepository.insert(video);

      const nonExistentVideoId = new VideoId();

      const result = await videoRepository.existsById([
        video.videoId,
        nonExistentVideoId,
      ]);

      expect(result.existent).toEqual([video.videoId]);
      expect(result.nonExistent).toEqual([nonExistentVideoId]);
    });

    it('should throw InvalidArgumentError if videoId is empty', async () => {
      await expect(videoRepository.existsById([])).rejects.toThrow(
        InvalidArgumentError,
      );
    });
  });

  describe('update', () => {
    it('should update a video', async () => {
      const { category, genre, castMember } = await createRelations();

      const video = Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await videoRepository.insert(video);

      video.changeTitle('new title');

      await uow.start();
      await videoRepository.update(video);
      await uow.commit();

      const result = await videoRepository.findById(video.videoId);

      expect(result!.title).toBe(video.title);
    });

    it('should throw NotFoundError if video does not exist', async () => {
      const video = Video.fake().aVideoWithoutMedias().build();

      await expect(videoRepository.update(video)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should delete a video', async () => {
      const { category, genre, castMember } = await createRelations();

      const video = Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();
      await videoRepository.insert(video);

      await videoRepository.delete(video.videoId);

      const result = await videoRepository.findById(video.videoId);

      expect(result).toBeNull();
    });

    it('should throw NotFoundError if video does not exist', async () => {
      const videoId = new VideoId();

      await expect(videoRepository.delete(videoId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('search', () => {
    it('should search videos', async () => {
      const { category, genre, castMember } = await createRelations();

      const genres = Video.fake()
        .theVideosWithAllMedias(2)
        .withTitle('movie')
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await uow.start();
      await videoRepository.bulkInsert(genres);

      const searchParams = VideoSearchParams.create({
        filter: {
          title: 'movie',
          categoryIds: [category.categoryId],
          genreIds: [genre.genreId],
          castMemberIds: [castMember.castMemberId],
        },
      });

      const result = await videoRepository.search(searchParams);
      await uow.commit();

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should search videos with pagination and sort', async () => {
      const { category, genre, castMember } = await createRelations();

      const genres = Video.fake()
        .theVideosWithAllMedias(2)
        .withTitle('movie')
        .addCategoryId(category.categoryId)
        .addGenreId(genre.genreId)
        .addCastMemberId(castMember.castMemberId)
        .build();

      await uow.start();
      await videoRepository.bulkInsert(genres);

      const searchParams = VideoSearchParams.create({
        page: 1,
        perPage: 10,
        sort: 'title',
        sortDir: 'asc',
      });

      const result = await videoRepository.search(searchParams);

      await uow.commit();

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
    });
  });

  async function createRelations() {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.categoryId)
      .build();
    await genreRepository.insert(genre);

    const castMember = CastMember.fake().anActor().build();
    await castMemberRepository.insert(castMember);

    return { category, genre, castMember };
  }
});
