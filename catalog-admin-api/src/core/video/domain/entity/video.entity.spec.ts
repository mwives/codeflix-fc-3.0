import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { VideoCreatedEvent } from '../domain-events/video-created.event';
import { VideoCreateCommand, Video, VideoId } from './video.entity';
import { Rating, RatingValues } from './vo/rating.vo';
import { Banner } from './vo/banner.vo';
import { ThumbnailHalf } from './vo/thumbnail-half.vo';
import { Thumbnail } from './vo/thumbnail.vo';
import { Trailer } from './vo/trailer.vo';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-object/value-objects/audio-video-media.vo';
import { VideoMedia } from './vo/video-media.vo';

describe('Video', () => {
  beforeEach(() => {
    Video.prototype.validate = jest
      .fn()
      .mockImplementation(Video.prototype.validate);
  });

  describe('constructor', () => {
    it('should create a video with the correct values', () => {
      const categoryId = new CategoryId();
      const categoryIds = new Map([[categoryId.id, categoryId]]);

      const genreId = new GenreId();
      const genreIds = new Map<string, GenreId>([[genreId.id, genreId]]);

      const castMemberId = new CastMemberId();
      const castMemberIds = new Map<string, CastMemberId>([
        [castMemberId.id, castMemberId],
      ]);

      const rating = Rating.createRL();

      const banner = new Banner({
        name: 'any_name',
        location: 'any_location',
      });

      const thumbnail = new Thumbnail({
        name: 'any_name',
        location: 'any_location',
      });

      const thumbnailHalf = new ThumbnailHalf({
        name: 'any_name',
        location: 'any_location',
      });

      const trailer = new Trailer({
        name: 'any_name',
        rawLocation: 'any_raw_location',
        status: AudioVideoMediaStatus.PENDING,
      });

      const videoMedia = new VideoMedia({
        name: 'any_name',
        rawLocation: 'any_raw_location',
        status: AudioVideoMediaStatus.PENDING,
      });

      let video = new Video({
        title: 'any_title',
        description: 'any_description',
        releaseYear: 2020,
        duration: 90,
        rating,
        isNewRelease: true,
        isPublished: true,
        categoryIds,
        genreIds,
        castMemberIds,
        banner,
        thumbnail,
        thumbnailHalf,
        trailer,
        video: videoMedia,
      });

      expect(video).toBeInstanceOf(Video);
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(video.rating).toBeInstanceOf(Rating);
      expect(video.categoryIds).toEqual(categoryIds);
      expect(video.genreIds).toEqual(genreIds);
      expect(video.castMemberIds).toEqual(castMemberIds);
      expect(video.banner).toEqual(banner);
      expect(video.thumbnail).toEqual(thumbnail);
      expect(video.thumbnailHalf).toEqual(thumbnailHalf);
      expect(video.trailer).toEqual(trailer);
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video).toMatchObject({
        title: 'any_title',
        description: 'any_description',
        releaseYear: 2020,
        duration: 90,
        rating,
        isNewRelease: true,
        isPublished: true,
        categoryIds,
        genreIds,
        castMemberIds,
      });
    });
  });

  describe('create', () => {
    it('should create a video with the correct values', () => {
      const categoryId = new CategoryId();
      const categoryIds = [categoryId];

      const genreId = new GenreId();
      const genreIds = [genreId];

      const castMemberId = new CastMemberId();
      const castMemberIds = [castMemberId];

      const rating = Rating.createRL();

      const banner = new Banner({
        name: 'any_name',
        location: 'any_location',
      });

      const thumbnail = new Thumbnail({
        name: 'any_name',
        location: 'any_location',
      });

      const thumbnailHalf = new ThumbnailHalf({
        name: 'any_name',
        location: 'any_location',
      });

      const trailer = new Trailer({
        name: 'any_name',
        rawLocation: 'any_raw_location',
        status: AudioVideoMediaStatus.PENDING,
      });

      const videoMedia = new VideoMedia({
        name: 'any_name',
        rawLocation: 'any_raw_location',
        status: AudioVideoMediaStatus.PENDING,
      });

      let video = Video.create({
        title: 'any_title',
        description: 'any_description',
        releaseYear: 2020,
        duration: 90,
        rating,
        isNewRelease: true,
        categoryIds,
        genreIds,
        castMemberIds,
        banner,
        thumbnail,
        thumbnailHalf,
        trailer,
        video: videoMedia,
      });

      expect(video).toBeInstanceOf(Video);
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(video.rating).toBeInstanceOf(Rating);
      expect(video.banner).toEqual(banner);
      expect(video.thumbnail).toEqual(thumbnail);
      expect(video.thumbnailHalf).toEqual(thumbnailHalf);
      expect(video.trailer).toEqual(trailer);
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video).toMatchObject({
        title: 'any_title',
        description: 'any_description',
        releaseYear: 2020,
        duration: 90,
        isNewRelease: true,
        isPublished: false,
      });
    });
  });

  describe('changeTitle', () => {
    it('should change the title of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();

      video.changeTitle('new_title');

      expect(video.title).toBe('new_title');
      expect(Video.prototype.validate).toHaveBeenCalledTimes(3);
    });
  });

  describe('changeDescription', () => {
    it('should change the description of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeDescription('new_description');
      expect(video.description).toBe('new_description');
    });
  });

  describe('changeReleaseYear', () => {
    it('should change the release year of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeReleaseYear(2025);
      expect(video.releaseYear).toBe(2025);
    });
  });

  describe('changeDuration', () => {
    it('should change the duration of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeDuration(120);
      expect(video.duration).toBe(120);
    });
  });

  describe('changeRating', () => {
    it('should change the rating of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.changeRating(Rating.createRL());
      expect(video.rating).toEqual(Rating.createRL());
    });
  });

  describe('markAsNewRelease', () => {
    it('should mark the video as a new release', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.markAsNewRelease();
      expect(video.isNewRelease).toBe(true);
    });
  });

  describe('markAsNotNewRelease', () => {
    it('should mark the video as not a new release', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      video.markAsNotNewRelease();
      expect(video.isNewRelease).toBe(false);
    });
  });

  describe('replaceBanner', () => {
    it('should replace the banner of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const banner = new Banner({
        name: 'new_name',
        location: 'new_location',
      });

      video.replaceBanner(banner);

      expect(video.banner).toEqual(banner);
    });
  });

  describe('replaceThumbnail', () => {
    it('should replace the thumbnail of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const thumbnail = new Thumbnail({
        name: 'new_name',
        location: 'new_location',
      });

      video.replaceThumbnail(thumbnail);

      expect(video.thumbnail).toEqual(thumbnail);
    });
  });

  describe('replaceThumbnailHalf', () => {
    it('should replace the thumbnail half of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const thumbnailHalf = new ThumbnailHalf({
        name: 'new_name',
        location: 'new_location',
      });

      video.replaceThumbnailHalf(thumbnailHalf);

      expect(video.thumbnailHalf).toEqual(thumbnailHalf);
    });
  });

  describe('replaceTrailer', () => {
    it('should replace the trailer of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const trailer = new Trailer({
        name: 'new_name',
        rawLocation: 'new_raw_location',
        status: AudioVideoMediaStatus.PENDING,
      });

      video.replaceTrailer(trailer);

      expect(video.trailer).toEqual(trailer);
    });
  });

  describe('replaceVideo', () => {
    it('should replace the video of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const videoMedia = new VideoMedia({
        name: 'new_name',
        rawLocation: 'new_raw_location',
        status: AudioVideoMediaStatus.PENDING,
      });

      video.replaceVideo(videoMedia);

      expect(video.video).toEqual(videoMedia);
    });
  });

  describe('addCategoryId', () => {
    it('should add a category id to the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const categoryId = new CategoryId();

      video.addCategoryId(categoryId);

      expect(video.categoryIds.has(categoryId.id)).toBe(true);
    });
  });

  describe('removeCategoryId', () => {
    it('should remove a category id from the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const categoryId = new CategoryId();

      video.addCategoryId(categoryId);
      video.removeCategoryId(categoryId);

      expect(video.categoryIds.has(categoryId.id)).toBe(false);
    });
  });

  describe('syncCategoryIds', () => {
    it('should sync the category ids of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const categoryId = new CategoryId();
      const categoryIds = [categoryId];

      video.syncCategoryIds(categoryIds);

      expect(video.categoryIds.size).toBe(1);
      expect(video.categoryIds.has(categoryId.id)).toBe(true);
    });

    it('should throw an error if the category ids are empty', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const categoryIds = [];

      expect(() => video.syncCategoryIds(categoryIds)).toThrow(
        'Category ids is empty',
      );
    });
  });

  describe('addGenreId', () => {
    it('should add a genre id to the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const genreId = new GenreId();

      video.addGenreId(genreId);

      expect(video.genreIds.has(genreId.id)).toBe(true);
    });
  });

  describe('removeGenreId', () => {
    it('should remove a genre id from the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const genreId = new GenreId();

      video.addGenreId(genreId);
      video.removeGenreId(genreId);

      expect(video.genreIds.has(genreId.id)).toBe(false);
    });
  });

  describe('syncGenresId', () => {
    it('should sync the genre ids of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const genreId = new GenreId();
      const genreIds = [genreId];

      video.syncGenresId(genreIds);

      expect(video.genreIds.size).toBe(1);
      expect(video.genreIds.has(genreId.id)).toBe(true);
    });

    it('should throw an error if the genre ids are empty', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const genreIds = [];

      expect(() => video.syncGenresId(genreIds)).toThrow('Genre ids is empty');
    });
  });

  describe('addCastMemberId', () => {
    it('should add a cast member id to the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const castMemberId = new CastMemberId();

      video.addCastMemberId(castMemberId);

      expect(video.castMemberIds.has(castMemberId.id)).toBe(true);
    });
  });

  describe('removeCastMemberId', () => {
    it('should remove a cast member id from the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const castMemberId = new CastMemberId();

      video.addCastMemberId(castMemberId);
      video.removeCastMemberId(castMemberId);

      expect(video.castMemberIds.has(castMemberId.id)).toBe(false);
    });
  });

  describe('syncCastMembersId', () => {
    it('should sync the cast members ids of the video', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const castMemberId = new CastMemberId();
      const castMemberIds = [castMemberId];

      video.syncCastMembersId(castMemberIds);

      expect(video.castMemberIds.size).toBe(1);
      expect(video.castMemberIds.has(castMemberId.id)).toBe(true);
    });

    it('should throw an error if the cast members ids are empty', () => {
      const video = Video.fake().aVideoWithoutMedias().build();
      const castMemberIds = [];

      expect(() => video.syncCastMembersId(castMemberIds)).toThrow(
        'Cast member ids is empty',
      );
    });
  });
});
