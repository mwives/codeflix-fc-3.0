import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { Notification } from '@core/shared/domain/validators/notification';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { Banner } from '@core/video/domain/entity/vo/banner.vo';
import { Rating } from '@core/video/domain/entity/vo/rating.vo';
import { ThumbnailHalf } from '@core/video/domain/entity/vo/thumbnail-half.vo';
import { Thumbnail } from '@core/video/domain/entity/vo/thumbnail.vo';
import { Trailer } from '@core/video/domain/entity/vo/trailer.vo';
import { VideoMedia } from '@core/video/domain/entity/vo/video-media.vo';
import {
  AudioVideoMediaModel,
  AudioVideoMediaType,
} from './audio-video-media.model';
import { ImageMediaModel, VideoImageMediaType } from './image-media.model';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from './video.model';

export class VideoModelMapper {
  static toEntity(model: VideoModel) {
    const {
      videoId: id,
      categoryIds = [],
      genreIds = [],
      castMemberIds = [],
      imageMedias = [],
      audioVideoMedias = [],
      ...otherData
    } = model.toJSON();

    const categoriesId = categoryIds.map((c) => new CategoryId(c.categoryId));
    const genresId = genreIds.map((c) => new GenreId(c.genreId));
    const castMembersId = castMemberIds.map(
      (c) => new CastMemberId(c.castMemberId),
    );

    const notification = new Notification();

    if (!categoriesId.length) {
      notification.addError('categoryIds should not be empty', 'categoryIds');
    }
    if (!genresId.length) {
      notification.addError('genreIds should not be empty', 'genreIds');
    }
    if (!castMembersId.length) {
      notification.addError(
        'castMemberIds should not be empty',
        'castMemberIds',
      );
    }

    console.log('imageMedias', imageMedias);

    const bannerModel = imageMedias.find(
      (i) => i.videoImageMediaType === 'banner',
    );
    const banner = bannerModel
      ? new Banner({
          name: bannerModel.name,
          location: bannerModel.location,
        })
      : null;

    const thumbnailModel = imageMedias.find(
      (i) => i.videoImageMediaType === 'thumbnail',
    );
    const thumbnail = thumbnailModel
      ? new Thumbnail({
          name: thumbnailModel.name,
          location: thumbnailModel.location,
        })
      : null;

    const thumbnailHalfModel = imageMedias.find(
      (i) => i.videoImageMediaType === 'thumbnail_half',
    );

    const thumbnailHalf = thumbnailHalfModel
      ? new ThumbnailHalf({
          name: thumbnailHalfModel.name,
          location: thumbnailHalfModel.location,
        })
      : null;

    const trailerModel = audioVideoMedias.find(
      (i) => i.mediaType === 'trailer',
    );

    const trailer = trailerModel
      ? new Trailer({
          name: trailerModel.name,
          rawLocation: trailerModel.rawLocation,
          encodedLocation: trailerModel.encodedLocation,
          status: trailerModel.status,
        })
      : null;

    const videoModel = audioVideoMedias.find((i) => i.mediaType === 'video');

    const videoMedia = videoModel
      ? new VideoMedia({
          name: videoModel.name,
          rawLocation: videoModel.rawLocation,
          encodedLocation: videoModel.encodedLocation,
          status: videoModel.status,
        })
      : null;

    const [rating, errorRating] = Rating.create(otherData.rating).asArray();

    if (errorRating) {
      notification.addError(errorRating.message, 'rating');
    }

    const videoEntity = new Video({
      ...otherData,
      rating,
      videoId: new VideoId(id),
      banner,
      thumbnail,
      thumbnailHalf,
      trailer,
      video: videoMedia,
      categoryIds: new Map(categoriesId.map((c) => [c.id, c])),
      genreIds: new Map(genresId.map((c) => [c.id, c])),
      castMemberIds: new Map(castMembersId.map((c) => [c.id, c])),
    });

    videoEntity.validate();

    notification.copyErrors(videoEntity.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return videoEntity;
  }

  static toModel(entity: Video) {
    const {
      banner,
      thumbnail,
      thumbnailHalf,
      trailer,
      video,
      categoryIds,
      genreIds,
      castMemberIds,
      ...otherData
    } = entity.toJSON();
    return {
      ...otherData,
      imageMedias: [
        {
          media: banner,
          videoImageMediaType: VideoImageMediaType.BANNER,
        },
        {
          media: thumbnail,
          videoImageMediaType: VideoImageMediaType.THUMBNAIL,
        },
        {
          media: thumbnailHalf,
          videoImageMediaType: VideoImageMediaType.THUMBNAIL_HALF,
        },
      ]
        .map((item) => {
          return item.media
            ? ImageMediaModel.build({
                videoId: entity.videoId.id,
                name: item.media.name,
                location: item.media.location,
                videoImageMediaType: item.videoImageMediaType as any,
              } as any)
            : null;
        })
        .filter(Boolean),

      audioVideoMedias: [trailer, video]
        .map((audioVideoMedia, index) => {
          return audioVideoMedia
            ? AudioVideoMediaModel.build({
                videoId: entity.videoId.id,
                name: audioVideoMedia.name,
                rawLocation: audioVideoMedia.rawLocation,
                encodedLocation: audioVideoMedia.encodedLocation,
                status: audioVideoMedia.status,
                videoImageMediaType:
                  index === 0
                    ? AudioVideoMediaType.TRAILER
                    : AudioVideoMediaType.VIDEO,
              } as any)
            : null;
        })
        .filter(Boolean),
      categoryIds: categoryIds.map((categoryId) =>
        VideoCategoryModel.build({
          videoId: entity.videoId.id,
          categoryId: categoryId,
        }),
      ),
      genreIds: genreIds.map((categoryId) =>
        VideoGenreModel.build({
          videoId: entity.videoId.id,
          genreId: categoryId,
        }),
      ),
      castMemberIds: castMemberIds.map((castMemberId) =>
        VideoCastMemberModel.build({
          videoId: entity.videoId.id,
          castMemberId: castMemberId,
        }),
      ),
    };
  }
}
