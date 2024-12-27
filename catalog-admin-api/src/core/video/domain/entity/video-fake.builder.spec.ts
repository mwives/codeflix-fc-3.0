import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { Chance } from 'chance';
import { VideoFakeBuilder } from './video-fake.builder';
import { VideoId } from './video.entity';
import { Banner } from './vo/banner.vo';
import { Rating } from './vo/rating.vo';
import { ThumbnailHalf } from './vo/thumbnail-half.vo';
import { Thumbnail } from './vo/thumbnail.vo';
import { Trailer } from './vo/trailer.vo';
import { VideoMedia } from './vo/video-media.vo';

describe('VideoFakerBuilder', () => {
  describe('videoId prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    test('should throw error when any with methods has called', () => {
      expect(() => faker.videoId).toThrow(
        new Error("Property videoId not have a factory, use 'with' methods"),
      );
    });

    test('should be undefined', () => {
      expect(faker['_videoId']).toBeUndefined();
    });

    test('withVideoId', () => {
      const videoId = new VideoId();
      const $this = faker.withVideoId(videoId);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_videoId']).toBe(videoId);

      faker.withVideoId(() => videoId);
      //@ts-expect-error _videoId is a callable
      expect(faker['_videoId']()).toBe(videoId);

      expect(faker.videoId).toBe(videoId);
    });

    test('should pass index to videoId factory', () => {
      let mockFactory = jest.fn(() => new VideoId());
      faker.withVideoId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const genreId = new VideoId();
      mockFactory = jest.fn(() => genreId);
      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withVideoId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].videoId).toBe(genreId);
      expect(fakerMany.build()[1].videoId).toBe(genreId);
    });
  });

  describe('title prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test('should be a function', () => {
      expect(typeof faker['_title']).toBe('function');
    });

    test('should call chance.word', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withTitle', () => {
      const $this = faker.withTitle('test title');
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_title']).toBe('test title');

      faker.withTitle(() => 'test title');
      //@ts-expect-error title is callable
      expect(faker['_title']()).toBe('test title');

      expect(faker.title).toBe('test title');
    });

    test('should pass index to title factory', () => {
      faker.withTitle((index) => `test title ${index}`);
      const video = faker.build();
      expect(video.title).toBe(`test title 0`);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withTitle((index) => `test title ${index}`);
      const categories = fakerMany.build();

      expect(categories[0].title).toBe(`test title 0`);
      expect(categories[1].title).toBe(`test title 1`);
    });

    test('withInvalidTitleTooShort', () => {
      const $this = faker.withInvalidTitleTooLong();
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_title'].length).toBe(256);

      const tooLong = 'a'.repeat(256);
      faker.withInvalidTitleTooLong(tooLong);
      expect(faker['_title'].length).toBe(256);
      expect(faker['_title']).toBe(tooLong);
    });
  });

  describe('categoryIds prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    it('should be empty', () => {
      expect(faker['_categoryIds']).toBeInstanceOf(Array);
    });

    test('withCategoryId', () => {
      const categoryId1 = new CategoryId();
      const $this = faker.addCategoryId(categoryId1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_categoryIds']).toStrictEqual([categoryId1]);

      const categoryId2 = new CategoryId();
      faker.addCategoryId(() => categoryId2);

      expect([
        faker['_categoryIds'][0],
        // @ts-expect-error
        faker['_categoryIds'][1](),
      ]).toStrictEqual([categoryId1, categoryId2]);
    });

    it('should pass index to categoryIds factory', () => {
      const categoriesId = [new CategoryId(), new CategoryId()];
      faker.addCategoryId((index) => categoriesId[index]);
      const genre = faker.build();

      expect(genre.categoryIds.get(categoriesId[0].id)).toBe(categoriesId[0]);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.addCategoryId((index) => categoriesId[index]);
      const genres = fakerMany.build();

      expect(genres[0].categoryIds.get(categoriesId[0].id)).toBe(
        categoriesId[0],
      );

      expect(genres[1].categoryIds.get(categoriesId[1].id)).toBe(
        categoriesId[1],
      );
    });
  });

  describe('createdAt prop', () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    test('should throw error when any with methods has called', () => {
      const fakerVideo = VideoFakeBuilder.aVideoWithoutMedias();
      expect(() => fakerVideo.createdAt).toThrow(
        new Error("Property createdAt not have a factory, use 'with' methods"),
      );
    });

    test('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker['_createdAt']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error
      expect(faker['_createdAt']()).toBe(date);
      expect(faker.createdAt).toBe(date);
    });

    test('should pass index to createdAt factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const genre = faker.build();
      expect(genre.createdAt.getTime()).toBe(date.getTime() + 2);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const categories = fakerMany.build();

      expect(categories[0].createdAt.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].createdAt.getTime()).toBe(date.getTime() + 3);
    });
  });

  it('should create a video without medias', () => {
    let video = VideoFakeBuilder.aVideoWithoutMedias().build();

    expect(video.videoId).toBeInstanceOf(VideoId);
    expect(typeof video.title === 'string').toBeTruthy();
    expect(typeof video.description === 'string').toBeTruthy();
    expect(typeof video.releaseYear === 'number').toBeTruthy();
    expect(typeof video.duration === 'number').toBeTruthy();
    expect(video.rating).toEqual(Rating.createRL());
    expect(video.isNewRelease).toBeTruthy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnailHalf).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categoryIds).toBeInstanceOf(Map);
    expect(video.categoryIds.size).toBe(1);
    expect(video.categoryIds.values().next().value).toBeInstanceOf(CategoryId);
    expect(video.genreIds).toBeInstanceOf(Map);
    expect(video.genreIds.size).toBe(1);
    expect(video.genreIds.values().next().value).toBeInstanceOf(GenreId);
    expect(video.castMemberIds).toBeInstanceOf(Map);
    expect(video.castMemberIds.size).toBe(1);
    expect(video.castMemberIds.values().next().value).toBeInstanceOf(
      CastMemberId,
    );
    expect(video.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    video = VideoFakeBuilder.aVideoWithoutMedias()
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withCreatedAt(createdAt)
      .build();
    expect(video.videoId.id).toBe(videoId.id);
    expect(video.title).toBe('name test');
    expect(video.description).toBe('description test');
    expect(video.releaseYear).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toEqual(Rating.create10());
    expect(video.isNewRelease).toBeFalsy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnailHalf).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categoryIds).toBeInstanceOf(Map);
    expect(video.categoryIds.get(categoryId1.id)).toBe(categoryId1);
    expect(video.categoryIds.get(categoryId2.id)).toBe(categoryId2);
    expect(video.genreIds).toBeInstanceOf(Map);
    expect(video.genreIds.get(genreId1.id)).toBe(genreId1);
    expect(video.genreIds.get(genreId2.id)).toBe(genreId2);
    expect(video.castMemberIds).toBeInstanceOf(Map);
    expect(video.castMemberIds.get(castMemberId1.id)).toBe(castMemberId1);
    expect(video.castMemberIds.get(castMemberId2.id)).toBe(castMemberId2);
    expect(video.createdAt).toEqual(createdAt);
  });

  it('should create a video without medias', () => {
    let video = VideoFakeBuilder.aVideoWithAllMedias().build();

    expect(video.videoId).toBeInstanceOf(VideoId);
    expect(typeof video.title === 'string').toBeTruthy();
    expect(typeof video.description === 'string').toBeTruthy();
    expect(typeof video.releaseYear === 'number').toBeTruthy();
    expect(typeof video.duration === 'number').toBeTruthy();
    expect(video.rating).toEqual(Rating.createRL());
    expect(video.isNewRelease).toBeTruthy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBeInstanceOf(Banner);
    expect(video.thumbnail).toBeInstanceOf(Thumbnail);
    expect(video.thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
    expect(video.trailer).toBeInstanceOf(Trailer);
    expect(video.video).toBeInstanceOf(VideoMedia);
    expect(video.categoryIds).toBeInstanceOf(Map);
    expect(video.categoryIds.size).toBe(1);
    expect(video.categoryIds.values().next().value).toBeInstanceOf(CategoryId);
    expect(video.genreIds).toBeInstanceOf(Map);
    expect(video.genreIds.size).toBe(1);
    expect(video.genreIds.values().next().value).toBeInstanceOf(GenreId);
    expect(video.castMemberIds).toBeInstanceOf(Map);
    expect(video.castMemberIds.size).toBe(1);
    expect(video.castMemberIds.values().next().value).toBeInstanceOf(
      CastMemberId,
    );
    expect(video.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const banner = new Banner({
      location: 'location',
      name: 'name',
    });
    const thumbnail = new Thumbnail({
      location: 'location',
      name: 'name',
    });
    const thumbnailHalf = new ThumbnailHalf({
      location: 'location',
      name: 'name',
    });
    const trailer = Trailer.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    const videoMedia = VideoMedia.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    video = VideoFakeBuilder.aVideoWithAllMedias()
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withBanner(banner)
      .withThumbnail(thumbnail)
      .withThumbnailHalf(thumbnailHalf)
      .withTrailer(trailer)
      .withVideo(videoMedia)
      .withCreatedAt(createdAt)
      .build();
    expect(video.videoId.id).toBe(videoId.id);
    expect(video.title).toBe('name test');
    expect(video.description).toBe('description test');
    expect(video.releaseYear).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toEqual(Rating.create10());
    expect(video.isNewRelease).toBeFalsy();
    expect(video.isPublished).toBeFalsy();
    expect(video.banner).toBe(banner);
    expect(video.thumbnail).toBe(thumbnail);
    expect(video.thumbnailHalf).toBe(thumbnailHalf);
    expect(video.trailer).toBe(trailer);
    expect(video.video).toBe(videoMedia);
    expect(video.categoryIds).toBeInstanceOf(Map);
    expect(video.categoryIds.get(categoryId1.id)).toBe(categoryId1);
    expect(video.categoryIds.get(categoryId2.id)).toBe(categoryId2);
    expect(video.genreIds).toBeInstanceOf(Map);
    expect(video.genreIds.get(genreId1.id)).toBe(genreId1);
    expect(video.genreIds.get(genreId2.id)).toBe(genreId2);
    expect(video.castMemberIds).toBeInstanceOf(Map);
    expect(video.castMemberIds.get(castMemberId1.id)).toBe(castMemberId1);
    expect(video.castMemberIds.get(castMemberId2.id)).toBe(castMemberId2);
    expect(video.createdAt).toEqual(createdAt);
  });

  it('should create many videos without medias', () => {
    const faker = VideoFakeBuilder.theVideosWithoutMedias(2);
    let videos = faker.build();
    videos.forEach((video) => {
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(typeof video.title === 'string').toBeTruthy();
      expect(typeof video.description === 'string').toBeTruthy();
      expect(typeof video.releaseYear === 'number').toBeTruthy();
      expect(typeof video.duration === 'number').toBeTruthy();
      expect(video.rating).toEqual(Rating.createRL());
      expect(video.isNewRelease).toBeTruthy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoryIds).toBeInstanceOf(Map);
      expect(video.categoryIds.size).toBe(1);
      expect(video.categoryIds.values().next().value).toBeInstanceOf(
        CategoryId,
      );
      expect(video.genreIds).toBeInstanceOf(Map);
      expect(video.genreIds.size).toBe(1);
      expect(video.genreIds.values().next().value).toBeInstanceOf(GenreId);
      expect(video.castMemberIds).toBeInstanceOf(Map);
      expect(video.castMemberIds.size).toBe(1);
      expect(video.castMemberIds.values().next().value).toBeInstanceOf(
        CastMemberId,
      );
      expect(video.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    videos = VideoFakeBuilder.theVideosWithoutMedias(2)
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withCreatedAt(createdAt)
      .build();
    videos.forEach((video) => {
      expect(video.videoId.id).toBe(videoId.id);
      expect(video.title).toBe('name test');
      expect(video.description).toBe('description test');
      expect(video.releaseYear).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.create10());
      expect(video.isNewRelease).toBeFalsy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnailHalf).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categoryIds).toBeInstanceOf(Map);
      expect(video.categoryIds.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categoryIds.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genreIds).toBeInstanceOf(Map);
      expect(video.genreIds.get(genreId1.id)).toBe(genreId1);
      expect(video.genreIds.get(genreId2.id)).toBe(genreId2);
      expect(video.castMemberIds).toBeInstanceOf(Map);
      expect(video.castMemberIds.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.castMemberIds.get(castMemberId2.id)).toBe(castMemberId2);
      expect(video.createdAt).toEqual(createdAt);
    });
  });

  it('should create many videos with medias', () => {
    const faker = VideoFakeBuilder.theVideosWithAllMedias(2);
    let videos = faker.build();
    videos.forEach((video) => {
      expect(video.videoId).toBeInstanceOf(VideoId);
      expect(typeof video.title === 'string').toBeTruthy();
      expect(typeof video.description === 'string').toBeTruthy();
      expect(typeof video.releaseYear === 'number').toBeTruthy();
      expect(typeof video.duration === 'number').toBeTruthy();
      expect(video.rating).toEqual(Rating.createRL());
      expect(video.isNewRelease).toBeTruthy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBeInstanceOf(Banner);
      expect(video.thumbnail).toBeInstanceOf(Thumbnail);
      expect(video.thumbnailHalf).toBeInstanceOf(ThumbnailHalf);
      expect(video.trailer).toBeInstanceOf(Trailer);
      expect(video.video).toBeInstanceOf(VideoMedia);
      expect(video.categoryIds).toBeInstanceOf(Map);
      expect(video.categoryIds.size).toBe(1);
      expect(video.categoryIds.values().next().value).toBeInstanceOf(
        CategoryId,
      );
      expect(video.genreIds).toBeInstanceOf(Map);
      expect(video.genreIds.size).toBe(1);
      expect(video.genreIds.values().next().value).toBeInstanceOf(GenreId);
      expect(video.castMemberIds).toBeInstanceOf(Map);
      expect(video.castMemberIds.size).toBe(1);
      expect(video.castMemberIds.values().next().value).toBeInstanceOf(
        CastMemberId,
      );
      expect(video.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const banner = new Banner({
      location: 'location',
      name: 'name',
    });
    const thumbnail = new Thumbnail({
      location: 'location',
      name: 'name',
    });
    const thumbnailHalf = new ThumbnailHalf({
      location: 'location',
      name: 'name',
    });
    const trailer = Trailer.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    const videoMedia = VideoMedia.create({
      rawLocation: 'rawLocation',
      name: 'name',
    });
    videos = VideoFakeBuilder.theVideosWithAllMedias(2)
      .withVideoId(videoId)
      .withTitle('name test')
      .withDescription('description test')
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withBanner(banner)
      .withThumbnail(thumbnail)
      .withThumbnailHalf(thumbnailHalf)
      .withTrailer(trailer)
      .withVideo(videoMedia)
      .withCreatedAt(createdAt)
      .build();
    videos.forEach((video) => {
      expect(video.videoId.id).toBe(videoId.id);
      expect(video.title).toBe('name test');
      expect(video.description).toBe('description test');
      expect(video.releaseYear).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.create10());
      expect(video.isNewRelease).toBeFalsy();
      expect(video.isPublished).toBeFalsy();
      expect(video.banner).toBe(banner);
      expect(video.thumbnail).toBe(thumbnail);
      expect(video.thumbnailHalf).toBe(thumbnailHalf);
      expect(video.trailer).toBe(trailer);
      expect(video.video).toBe(videoMedia);
      expect(video.categoryIds).toBeInstanceOf(Map);
      expect(video.categoryIds.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categoryIds.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genreIds).toBeInstanceOf(Map);
      expect(video.genreIds.get(genreId1.id)).toBe(genreId1);
      expect(video.genreIds.get(genreId2.id)).toBe(genreId2);
      expect(video.castMemberIds).toBeInstanceOf(Map);
      expect(video.castMemberIds.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.castMemberIds.get(castMemberId2.id)).toBe(castMemberId2);
      expect(video.createdAt).toEqual(createdAt);
    });
  });
});
