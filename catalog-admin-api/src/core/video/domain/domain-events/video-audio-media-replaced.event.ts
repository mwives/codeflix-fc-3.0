import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { VideoId } from '../entity/video.entity';
import { Trailer } from '../entity/vo/trailer.vo';
import { VideoMedia } from '../entity/vo/video-media.vo';
import { ValueObject } from '@core/shared/domain/value-object/value-object';

type VideoAudioMediaReplacedProps = {
  entityId: VideoId;
  media: Trailer | VideoMedia;
  mediaType: 'trailer' | 'video';
};

export class VideoAudioMediaReplaced implements IDomainEvent {
  entityId: VideoId;
  occurrenceDate: Date;
  eventVersion: number;

  readonly media: Trailer | VideoMedia;
  readonly mediaType: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedProps) {
    this.entityId = props.entityId;
    this.media = props.media;
    this.mediaType = props.mediaType;
    this.occurrenceDate = new Date();
    this.eventVersion = 1;
  }
}
