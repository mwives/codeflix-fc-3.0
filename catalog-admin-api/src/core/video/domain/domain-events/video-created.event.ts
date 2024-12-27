import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { VideoId } from '../entity/video.entity';
import { Banner } from '../entity/vo/banner.vo';
import { Rating } from '../entity/vo/rating.vo';
import { ThumbnailHalf } from '../entity/vo/thumbnail-half.vo';
import { Thumbnail } from '../entity/vo/thumbnail.vo';
import { Trailer } from '../entity/vo/trailer.vo';
import { VideoMedia } from '../entity/vo/video-media.vo';

export type VideoCreatedEventProps = {
  videoId: VideoId;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: Rating;
  isNewRelease: boolean;
  isPublished: boolean;
  banner: Banner | null;
  thumbnail: Thumbnail | null;
  thumbnailHalf: ThumbnailHalf | null;
  trailer: Trailer | null;
  video: VideoMedia | null;
  categoryIds: CategoryId[];
  genreIds: GenreId[];
  castMemberIds: CastMemberId[];
  createdAt: Date;
};

export class VideoCreatedEvent implements IDomainEvent {
  readonly entityId: VideoId;
  readonly occurrenceDate: Date;
  readonly eventVersion: number;

  readonly title: string;
  readonly description: string;
  readonly releaseYear: number;
  readonly duration: number;
  readonly rating: Rating;
  readonly isNewRelease: boolean;
  readonly isPublished: boolean;
  readonly banner: Banner | null;
  readonly thumbnail: Thumbnail | null;
  readonly thumbnailHalf: ThumbnailHalf | null;
  readonly trailer: Trailer | null;
  readonly video: VideoMedia | null;
  readonly categoryIds: CategoryId[];
  readonly genreIds: GenreId[];
  readonly castMemberIds: CastMemberId[];
  readonly createdAt: Date;

  constructor(props: VideoCreatedEventProps) {
    this.entityId = props.videoId;
    this.title = props.title;
    this.description = props.description;
    this.releaseYear = props.releaseYear;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isNewRelease = props.isNewRelease;
    this.isPublished = props.isPublished;
    this.banner = props.banner;
    this.thumbnail = props.thumbnail;
    this.thumbnailHalf = props.thumbnailHalf;
    this.trailer = props.trailer;
    this.video = props.video;
    this.categoryIds = props.categoryIds;
    this.genreIds = props.genreIds;
    this.castMemberIds = props.castMemberIds;
    this.createdAt = props.createdAt;
    this.occurrenceDate = new Date();
    this.eventVersion = 1;
  }
}
