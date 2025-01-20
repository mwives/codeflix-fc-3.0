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
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-object/value-objects/audio-video-media.vo';
import { UnitOfWorkInMemory } from '@core/shared/infra/db/in-memory/unit-of-work-in-memory';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { Banner } from '@core/video/domain/entity/vo/banner.vo';
import { Rating, RatingValues } from '@core/video/domain/entity/vo/rating.vo';
import { Thumbnail } from '@core/video/domain/entity/vo/thumbnail.vo';
import { Trailer } from '@core/video/domain/entity/vo/trailer.vo';
import { VideoMedia } from '@core/video/domain/entity/vo/video-media.vo';
import {
  AudioVideoMediaModel,
  AudioVideoMediaType,
} from './audio-video-media.model';
import { ImageMediaModel, VideoImageMediaType } from './image-media.model';
import { setupSequelizeForVideo } from './testing/helpers';
import { VideoModelMapper } from './video-model.mapper';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from './video.model';

describe('VideoModelMapper Unit Tests', () => {
  let categoryRepo: ICategoryRepository;
  let genreRepo: IGenreRepository;
  let castMemberRepo: ICastMemberRepository;

  setupSequelizeForVideo();

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
    castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
    genreRepo = new GenreSequelizeRepository(
      GenreModel,
      new UnitOfWorkInMemory() as any,
    );
  });

  describe('toEntity', () => {
    it('should throw when try to map a model with invalid data', () => {
      const arrange = [
        {
          makeModel: () => {
            return VideoModel.build({
              videoId: '9366b7dc-2d71-4799-b91c-c64adb205104',
              title: 't'.repeat(256),
              categoryIds: [],
              genreIds: [],
              castMemberIds: [],
            } as any);
          },
          expectedErrors: [
            {
              categoryIds: ['categoryIds should not be empty'],
            },
            {
              genreIds: ['genreIds should not be empty'],
            },
            {
              castMemberIds: ['castMemberIds should not be empty'],
            },
            {
              rating: [
                `Invalid rating value: undefined. Expected one of: ${Object.values(RatingValues).join(', ')}`,
              ],
            },
            {
              title: ['title must be shorter than or equal to 255 characters'],
            },
          ],
        },
      ];

      for (const item of arrange) {
        try {
          VideoModelMapper.toEntity(item.makeModel());
          fail('The genre is valid, but it needs throws a LoadEntityError');
        } catch (e) {
          expect(e).toBeInstanceOf(LoadEntityError);
          expect(e.errors).toMatchObject(item.expectedErrors);
        }
      }
    });

    it('should convert a model to an entity', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category]);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.bulkInsert([genre]);

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepo.bulkInsert([castMember]);

      const videoProps = {
        videoId: new VideoId().id,
        title: 'title',
        description: 'description',
        releaseYear: 2020,
        duration: 90,
        rating: RatingValues.R10,
        isNewRelease: false,
        isPublished: false,
        createdAt: new Date(),
      };

      const model = await VideoModel.create(
        {
          ...videoProps,
          categoryIds: [
            VideoCategoryModel.build({
              videoId: videoProps.videoId,
              categoryId: category.categoryId.id,
            }),
          ],
          genreIds: [
            VideoGenreModel.build({
              videoId: videoProps.videoId,
              genreId: genre.genreId.id,
            }),
          ],
          castMemberIds: [
            VideoCastMemberModel.build({
              videoId: videoProps.videoId,
              castMemberId: castMember.castMemberId.id,
            }),
          ],
          imageMedias: [
            ImageMediaModel.build({
              name: 'banner',
              location: 'banner.jpg',
              videoId: videoProps.videoId,
              videoImageMediaType: VideoImageMediaType.BANNER,
            }),
            ImageMediaModel.build({
              name: 'thumbnail',
              location: 'thumbnail.jpg',
              videoId: videoProps.videoId,
              videoImageMediaType: VideoImageMediaType.THUMBNAIL,
            }),
            ImageMediaModel.build({
              name: 'thumbnail-half',
              location: 'thumbnail-half.jpg',
              videoId: videoProps.videoId,
              videoImageMediaType: VideoImageMediaType.THUMBNAIL_HALF,
            }),
          ],
          audioVideoMedias: [
            AudioVideoMediaModel.build({
              name: 'trailer',
              rawLocation: 'trailer.mp4',
              encodedLocation: 'trailer.mp4',
              status: AudioVideoMediaStatus.COMPLETED,
              videoId: videoProps.videoId,
              mediaType: AudioVideoMediaType.TRAILER,
            }),
            AudioVideoMediaModel.build({
              name: 'video',
              rawLocation: 'video.mp4',
              encodedLocation: 'video.mp4',
              status: AudioVideoMediaStatus.COMPLETED,
              videoId: videoProps.videoId,
              mediaType: AudioVideoMediaType.VIDEO,
            }),
          ],
        },
        {
          include: [
            'categoryIds',
            'genreIds',
            'castMemberIds',
            'imageMedias',
            'audioVideoMedias',
          ],
        },
      );

      const entity = VideoModelMapper.toEntity(model);

      expect(entity).toBeInstanceOf(Video);
      expect(entity.toJSON()).toMatchObject({
        ...videoProps,
        categoryIds: [category.categoryId.id],
        genreIds: [genre.genreId.id],
        castMemberIds: [castMember.castMemberId.id],
        banner: { name: 'banner', location: 'banner.jpg' },
        thumbnail: { name: 'thumbnail', location: 'thumbnail.jpg' },
        thumbnailHalf: {
          name: 'thumbnail-half',
          location: 'thumbnail-half.jpg',
        },
        trailer: {
          name: 'trailer',
          rawLocation: 'trailer.mp4',
          encodedLocation: 'trailer.mp4',
          status: AudioVideoMediaStatus.COMPLETED,
        },
        video: {
          name: 'video',
          rawLocation: 'video.mp4',
          encodedLocation: 'video.mp4',
          status: AudioVideoMediaStatus.COMPLETED,
        },
      });
    });
  });

  describe('toModel', () => {
    it('should convert an entity to a model', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category]);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepo.bulkInsert([genre]);

      const castMember = CastMember.fake().anActor().build();
      await castMemberRepo.bulkInsert([castMember]);

      const videoProps = {
        videoId: new VideoId(),
        title: 'title',
        description: 'description',
        releaseYear: 2020,
        duration: 90,
        rating: Rating.create10(),
        isNewRelease: false,
        isPublished: false,
        createdAt: new Date(),
      };

      const entity = new Video({
        ...videoProps,
        banner: new Banner({ name: 'banner', location: 'banner.jpg' }),
        thumbnail: new Thumbnail({
          name: 'thumbnail',
          location: 'thumbnail.jpg',
        }),
        categoryIds: new Map([[category.categoryId.id, category.categoryId]]),
        genreIds: new Map([[genre.genreId.id, genre.genreId]]),
        castMemberIds: new Map([
          [castMember.castMemberId.id, castMember.castMemberId],
        ]),
        video: new VideoMedia({
          name: 'video',
          rawLocation: 'video.mp4',
          encodedLocation: 'video.mp4',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
        trailer: new Trailer({
          name: 'trailer',
          rawLocation: 'trailer.mp4',
          encodedLocation: 'trailer.mp4',
          status: AudioVideoMediaStatus.COMPLETED,
        }),
      });

      const model = VideoModelMapper.toModel(entity);

      expect(model).toBeInstanceOf(Object);
      expect(model).toMatchObject({
        videoId: entity.videoId.id,
        title: entity.title,
        description: entity.description,
        releaseYear: entity.releaseYear,
        duration: entity.duration,
        rating: entity.rating.value,
        isNewRelease: entity.isNewRelease,
        isPublished: entity.isPublished,
        createdAt: entity.createdAt,
      });
    });
  });
});
