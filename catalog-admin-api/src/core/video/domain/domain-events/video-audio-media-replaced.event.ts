import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { VideoId } from '../entity/video.entity';
import { Trailer } from '../entity/vo/trailer.vo';
import { VideoMedia } from '../entity/vo/video-media.vo';

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

  getIntegrationEvent(): VideoAudioMediaUploadedIntegrationEvent {
    return new VideoAudioMediaUploadedIntegrationEvent(this);
  }
}

export class VideoAudioMediaUploadedIntegrationEvent
  implements IIntegrationEvent
{
  declare eventName: string;
  declare payload: any;
  declare eventVersion: number;
  declare occurrenceDate: Date;

  constructor(event: VideoAudioMediaReplaced) {
    this['resourceId'] = `${event.entityId.id}.${event.mediaType}`;
    this['filePath'] = event.media.rawUrl;
    // this.eventVersion = event.eventVersion;
    // this.occurrenceDate = event.occurrenceDate;
    // this.payload = {
    //   video_id: event.entityId.id,
    //   media: event.media.toJSON(),
    // };
    // this.eventName = this.constructor.name;
  }
}
