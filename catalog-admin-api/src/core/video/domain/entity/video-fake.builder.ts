import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { ImageMedia } from '@core/shared/domain/value-object/value-objects/image-media.vo';
import { VideoId, Video } from './video.entity';
import { Banner } from './vo/banner.vo';
import { Rating } from './vo/rating.vo';
import { ThumbnailHalf } from './vo/thumbnail-half.vo';
import { Thumbnail } from './vo/thumbnail.vo';
import { Trailer } from './vo/trailer.vo';
import { VideoMedia } from './vo/video-media.vo';
import { Chance } from 'chance';

type PropOrFactory<T> = T | ((index: number) => T);

export class VideoFakeBuilder<TBuild = any> {
  // auto generated in entity
  private _videoId: PropOrFactory<VideoId> | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _title: PropOrFactory<string> = (_index) => this.chance.word();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _description: PropOrFactory<string> = (_index) => this.chance.word();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _releaseYear: PropOrFactory<number> = (_index) => +this.chance.year();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _duration: PropOrFactory<number> = (_index) =>
    this.chance.integer({ min: 1, max: 100 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _rating: PropOrFactory<Rating> = (_index) => Rating.createRL();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _opened: PropOrFactory<boolean> = (_index) => true;
  private _banner: PropOrFactory<Banner | null> | undefined = new Banner({
    name: 'test-name-banner.png',
    location: 'test path banner',
  });
  private _thumbnail: PropOrFactory<Thumbnail | null> | undefined =
    new Thumbnail({
      name: 'test-name-thumbnail.png',
      location: 'test path thumbnail',
    });
  private _thumbnailHalf: PropOrFactory<ThumbnailHalf | null> | undefined =
    new ThumbnailHalf({
      name: 'test-name-thumbnail-half.png',
      location: 'test path thumbnail half',
    });
  private _trailer: PropOrFactory<Trailer | null> | undefined = Trailer.create({
    name: 'test-name-trailer.mp4',
    rawLocation: 'test path trailer',
  });
  private _video: PropOrFactory<VideoMedia | null> | undefined =
    VideoMedia.create({
      name: 'test-name-video.mp4',
      rawLocation: 'test path video',
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _categoryIds: PropOrFactory<CategoryId>[] = [];
  private _genreIds: PropOrFactory<GenreId>[] = [];
  private _castMemberIds: PropOrFactory<CastMemberId>[] = [];

  // auto generated in entity
  private _createdAt: PropOrFactory<Date> | undefined = undefined;

  private countObjs;

  static aVideoWithoutMedias() {
    return new VideoFakeBuilder<Video>()
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static aVideoWithAllMedias() {
    return new VideoFakeBuilder<Video>();
  }

  static theVideosWithoutMedias(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs)
      .withoutBanner()
      .withoutThumbnail()
      .withoutThumbnailHalf()
      .withoutTrailer()
      .withoutVideo();
  }

  static theVideosWithAllMedias(countObjs: number) {
    return new VideoFakeBuilder<Video[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withVideoId(valueOrFactory: PropOrFactory<VideoId>) {
    this._videoId = valueOrFactory;
    return this;
  }

  withTitle(valueOrFactory: PropOrFactory<string>) {
    this._title = valueOrFactory;
    return this;
  }

  withDescription(valueOrFactory: PropOrFactory<string>) {
    this._description = valueOrFactory;
    return this;
  }

  withYearLaunched(valueOrFactory: PropOrFactory<number>) {
    this._releaseYear = valueOrFactory;
    return this;
  }

  withDuration(valueOrFactory: PropOrFactory<number>) {
    this._duration = valueOrFactory;
    return this;
  }

  withRating(valueOrFactory: PropOrFactory<Rating>) {
    this._rating = valueOrFactory;
    return this;
  }

  withMarkAsOpened() {
    this._opened = true;
    return this;
  }

  withMarkAsNotOpened() {
    this._opened = false;
    return this;
  }

  withBanner(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._banner = valueOrFactory;
    return this;
  }

  withoutBanner() {
    this._banner = null;
    return this;
  }

  withThumbnail(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._thumbnail = valueOrFactory;
    return this;
  }

  withoutThumbnail() {
    this._thumbnail = null;
    return this;
  }

  withThumbnailHalf(valueOrFactory: PropOrFactory<ImageMedia | null>) {
    this._thumbnailHalf = valueOrFactory;
    return this;
  }

  withoutThumbnailHalf() {
    this._thumbnailHalf = null;
    return this;
  }

  withTrailer(valueOrFactory: PropOrFactory<Trailer | null>) {
    this._trailer = valueOrFactory;
    return this;
  }

  withTrailerComplete() {
    this._trailer = Trailer.create({
      name: 'test name trailer',
      rawLocation: 'test path trailer',
    }).complete('test encoded_location trailer');
    return this;
  }

  withoutTrailer() {
    this._trailer = null;
    return this;
  }

  withVideo(valueOrFactory: PropOrFactory<VideoMedia | null>) {
    this._video = valueOrFactory;
    return this;
  }

  withVideoComplete() {
    this._video = VideoMedia.create({
      name: 'test name video',
      rawLocation: 'test path video',
    }).complete('test encoded_location video');
    return this;
  }

  withoutVideo() {
    this._video = null;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categoryIds.push(valueOrFactory);
    return this;
  }

  addGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genreIds.push(valueOrFactory);
    return this;
  }

  addCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._castMemberIds.push(valueOrFactory);
    return this;
  }

  withInvalidTitleTooLong(value?: string) {
    this._title = value ?? this.chance.word({ length: 256 });
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const videos = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoryId = new CategoryId();
      const categoriesId = this._categoryIds.length
        ? this.callFactory(this._categoryIds, index)
        : [categoryId];

      const genreId = new GenreId();
      const genresId = this._genreIds.length
        ? this.callFactory(this._genreIds, index)
        : [genreId];

      const castMemberId = new CastMemberId();
      const castMembersId = this._castMemberIds.length
        ? this.callFactory(this._castMemberIds, index)
        : [castMemberId];

      const video = Video.create({
        title: this.callFactory(this._title, index),
        description: this.callFactory(this._description, index),
        releaseYear: this.callFactory(this._releaseYear, index),
        duration: this.callFactory(this._duration, index),
        rating: this.callFactory(this._rating, index),
        isNewRelease: this.callFactory(this._opened, index),
        banner: this.callFactory(this._banner, index),
        thumbnail: this.callFactory(this._thumbnail, index),
        thumbnailHalf: this.callFactory(this._thumbnailHalf, index),
        trailer: this.callFactory(this._trailer, index),
        video: this.callFactory(this._video, index),
        categoryIds: categoriesId,
        genreIds: genresId,
        castMemberIds: castMembersId,
        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt, index),
        }),
      });
      video['videoId'] = !this._videoId
        ? video['videoId']
        : this.callFactory(this._videoId, index);
      video.validate();
      return video;
    });
    return this.countObjs === 1 ? (videos[0] as TBuild) : (videos as TBuild);
  }

  get videoId() {
    return this.getValue('videoId');
  }

  get title() {
    return this.getValue('title');
  }

  get description() {
    return this.getValue('description');
  }

  get releaseYear() {
    return this.getValue('releaseYear');
  }

  get duration() {
    return this.getValue('duration');
  }

  get rating() {
    return this.getValue('rating');
  }

  get isNewRelease() {
    return this.getValue('isNewRelease');
  }

  get banner() {
    const banner = this.getValue('banner');
    return (
      banner ??
      new Banner({
        name: 'test-name-banner.png',
        location: 'test path banner',
      })
    );
  }

  get thumbnail() {
    const thumbnail = this.getValue('thumbnail');
    return (
      thumbnail ??
      new Thumbnail({
        name: 'test-name-thumbnail.png',
        location: 'test path thumbnail',
      })
    );
  }

  get thumbnailHalf() {
    const thumbnailHalf = this.getValue('thumbnailHalf');
    return (
      thumbnailHalf ??
      new ThumbnailHalf({
        name: 'test-name-thumbnail-half.png',
        location: 'test path thumbnail half',
      })
    );
  }

  get trailer() {
    const trailer = this.getValue('trailer');
    return (
      trailer ??
      Trailer.create({
        name: 'test-name-trailer.mp4',
        rawLocation: 'test path trailer',
      })
    );
  }

  get video() {
    const video = this.getValue('video');
    return (
      video ??
      Trailer.create({
        name: 'test-name-video.mp4',
        rawLocation: 'test path video',
      })
    );
  }

  get categoryIds(): CategoryId[] {
    let categoryIds = this.getValue('categoryIds');

    if (!categoryIds.length) {
      categoryIds = [new CategoryId()];
    }
    return categoryIds;
  }

  get genreIds(): GenreId[] {
    let genreIds = this.getValue('genreIds');

    if (!genreIds.length) {
      genreIds = [new GenreId()];
    }
    return genreIds;
  }

  get castMemberIds(): CastMemberId[] {
    let castMemberIds = this.getValue('castMemberIds');

    if (!castMemberIds.length) {
      castMemberIds = [new CastMemberId()];
    }

    return castMemberIds;
  }

  get createdAt() {
    return this.getValue('createdAt');
  }

  private getValue(prop: any) {
    const optional = ['videoId', 'createdAt'];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }
    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}
