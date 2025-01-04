import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { AggregateRoot } from '@core/shared/domain/entity/aggregate-root';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-object/value-objects/audio-video-media.vo';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import VideoValidatorFactory from '../validator/video.validator';
import { VideoFakeBuilder } from './video-fake.builder';
import { Banner } from './vo/banner.vo';
import { Rating } from './vo/rating.vo';
import { ThumbnailHalf } from './vo/thumbnail-half.vo';
import { Thumbnail } from './vo/thumbnail.vo';
import { Trailer } from './vo/trailer.vo';
import { VideoMedia } from './vo/video-media.vo';
import { VideoCreatedEvent } from '../domain-events/video-created.event';
import { VideoAudioMediaReplaced } from '../domain-events/video-audio-media-replaced.event';

export type VideoConstructorProps = {
  videoId?: VideoId;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: Rating;
  isNewRelease: boolean;
  isPublished: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnailHalf?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;

  categoryIds: Map<string, CategoryId>;
  genreIds: Map<string, GenreId>;
  castMemberIds: Map<string, CastMemberId>;
  createdAt?: Date;
};

export type VideoCreateCommand = {
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: Rating;
  isNewRelease: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnailHalf?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;

  categoryIds: CategoryId[];
  genreIds: GenreId[];
  castMemberIds: CastMemberId[];
};

export class VideoId extends Uuid {}

export class Video extends AggregateRoot {
  videoId: VideoId;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: Rating;
  isNewRelease: boolean;
  isPublished: boolean;

  banner?: Banner;
  thumbnail?: Thumbnail;
  thumbnailHalf?: ThumbnailHalf;
  trailer?: Trailer;
  video?: VideoMedia;

  categoryIds: Map<string, CategoryId>;
  genreIds: Map<string, GenreId>;
  castMemberIds: Map<string, CastMemberId>;
  createdAt: Date;

  constructor(props: VideoConstructorProps) {
    super();

    this.videoId = props.videoId ?? new VideoId();
    this.title = props.title;
    this.description = props.description;
    this.releaseYear = props.releaseYear;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isNewRelease = props.isNewRelease;
    this.isPublished = props.isPublished;

    this.banner = props.banner ?? null;
    this.thumbnail = props.thumbnail ?? null;
    this.thumbnailHalf = props.thumbnailHalf ?? null;
    this.trailer = props.trailer ?? null;
    this.video = props.video ?? null;

    this.categoryIds = props.categoryIds;
    this.genreIds = props.genreIds;
    this.castMemberIds = props.castMemberIds;
    this.createdAt = props.createdAt ?? new Date();

    this.registerHandler(
      VideoCreatedEvent.name,
      this.onVideoCreated.bind(this),
    );

    this.registerHandler(
      VideoAudioMediaReplaced.name,
      this.onAudioVideoMediaReplaced.bind(this),
    );
  }

  static create(props: VideoCreateCommand) {
    const video = new Video({
      ...props,
      categoryIds: new Map(props.categoryIds.map((id) => [id.id, id])),
      genreIds: new Map(props.genreIds.map((id) => [id.id, id])),
      castMemberIds: new Map(props.castMemberIds.map((id) => [id.id, id])),
      isPublished: false,
    });

    video.validate(['title']);
    video.markAsPublished();
    video.applyEvent(
      new VideoCreatedEvent({
        videoId: video.videoId,
        title: video.title,
        description: video.description,
        releaseYear: video.releaseYear,
        duration: video.duration,
        rating: video.rating,
        isNewRelease: video.isNewRelease,
        isPublished: video.isPublished,
        banner: video.banner,
        thumbnail: video.thumbnail,
        thumbnailHalf: video.thumbnailHalf,
        trailer: video.trailer,
        video: video.video,
        categoryIds: Array.from(video.categoryIds.values()),
        genreIds: Array.from(video.genreIds.values()),
        castMemberIds: Array.from(video.castMemberIds.values()),
        createdAt: video.createdAt,
      }),
    );

    return video;
  }

  changeTitle(title: string): void {
    this.title = title;
    this.validate(['title']);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  changeReleaseYear(releaseYear: number): void {
    this.releaseYear = releaseYear;
  }

  changeDuration(duration: number): void {
    this.duration = duration;
  }

  changeRating(rating: Rating): void {
    this.rating = rating;
  }

  markAsNewRelease(): void {
    this.isNewRelease = true;
  }

  markAsNotNewRelease(): void {
    this.isNewRelease = false;
  }

  replaceBanner(banner: Banner): void {
    this.banner = banner;
  }

  replaceThumbnail(thumbnail: Thumbnail): void {
    this.thumbnail = thumbnail;
  }

  replaceThumbnailHalf(thumbnailHalf: ThumbnailHalf): void {
    this.thumbnailHalf = thumbnailHalf;
  }

  replaceTrailer(trailer: Trailer): void {
    this.trailer = trailer;
    this.markAsPublished();
  }

  replaceVideo(video: VideoMedia): void {
    this.video = video;
    this.markAsPublished();
  }

  addCategoryId(categoryId: CategoryId): void {
    this.categoryIds.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId): void {
    this.categoryIds.delete(categoryId.id);
  }

  syncCategoryIds(categoryIds: CategoryId[]): void {
    if (!categoryIds.length) {
      throw new Error('Category ids is empty');
    }

    this.categoryIds = new Map(categoryIds.map((id) => [id.id, id]));
  }

  addGenreId(genreId: GenreId): void {
    this.genreIds.set(genreId.id, genreId);
  }

  removeGenreId(genreId: GenreId): void {
    this.genreIds.delete(genreId.id);
  }

  syncGenresId(genreIds: GenreId[]): void {
    if (!genreIds.length) {
      throw new Error('Genre ids is empty');
    }
    this.genreIds = new Map(genreIds.map((id) => [id.id, id]));
  }

  addCastMemberId(castMemberId: CastMemberId): void {
    this.castMemberIds.set(castMemberId.id, castMemberId);
  }

  removeCastMemberId(castMemberId: CastMemberId): void {
    this.castMemberIds.delete(castMemberId.id);
  }

  syncCastMembersId(castMemberIds: CastMemberId[]): void {
    if (!castMemberIds.length) {
      throw new Error('Cast member ids is empty');
    }
    this.castMemberIds = new Map(castMemberIds.map((id) => [id.id, id]));
  }

  onVideoCreated(event: VideoCreatedEvent) {
    if (this.isPublished) return;
    this.markAsPublished();
  }

  onAudioVideoMediaReplaced(event: VideoAudioMediaReplaced) {
    if (this.isPublished) return;
    this.markAsPublished();
  }

  private markAsPublished() {
    if (
      this.trailer &&
      this.video &&
      this.trailer.status === AudioVideoMediaStatus.COMPLETED &&
      this.video.status === AudioVideoMediaStatus.COMPLETED
    ) {
      this.isPublished = true;
    }
  }

  validate(fields?: string[]) {
    const validator = VideoValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return VideoFakeBuilder;
  }

  get entityId() {
    return this.videoId;
  }

  toJSON() {
    return {
      videoId: this.videoId.id,
      title: this.title,
      description: this.description,
      releaseYear: this.releaseYear,
      duration: this.duration,
      rating: this.rating.value,
      isNewRelease: this.isNewRelease,
      isPublished: this.isPublished,
      banner: this.banner?.toJSON(),
      thumbnail: this.thumbnail?.toJSON(),
      thumbnailHalf: this.thumbnailHalf?.toJSON(),
      trailer: this.trailer?.toJSON(),
      video: this.video?.toJSON(),
      categoryIds: Array.from(this.categoryIds.values()).map((id) => id.id),
      genreIds: Array.from(this.genreIds.values()).map((id) => id.id),
      castMemberIds: Array.from(this.castMemberIds.values()).map((id) => id.id),
      createdAt: this.createdAt,
    };
  }
}
