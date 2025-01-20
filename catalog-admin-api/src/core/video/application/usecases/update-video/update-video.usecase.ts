import { CastMembersStorageValidator } from '@core/cast-member/application/validations/cast-member-storage.validator';
import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { GenresIdStorageValidator } from '@core/genre/application/validations/genre-id-storage.validator';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { Rating } from '@core/video/domain/entity/vo/rating.vo';
import { IVideoRepository } from '@core/video/domain/repository/video.repository';
import { UpdateVideoInput } from './update-video.input';

export class UpdateVideoUseCase
  implements IUseCase<UpdateVideoInput, UpdateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoriesIdValidator: CategoryIdStorageValidator,
    private genresIdValidator: GenresIdStorageValidator,
    private castMembersIdValidator: CastMembersStorageValidator,
  ) {}

  async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
    const videoId = new VideoId(input.id);
    const video = await this.videoRepo.findById(videoId);

    if (!video) throw new NotFoundError(input.id, Video);

    if (input.title) video.changeTitle(input.title);
    if (input.description) video.changeDescription(input.description);
    if (input.releaseYear) video.changeReleaseYear(input.releaseYear);
    if (input.duration) video.changeDuration(input.duration);

    if (input.rating) {
      const [type, errorRating] = Rating.create(input.rating).asArray();
      video.changeRating(type);
      if (errorRating) video.notification.setError(errorRating.message, 'type');
    }

    if (input.isNewRelease === true) video.markAsNewRelease();
    if (input.isNewRelease === false) video.markAsNotNewRelease();

    const notification = video.notification;

    if (input.categoryIds) {
      const [categoriesId, errorsCategoriesId] = (
        await this.categoriesIdValidator.validate(input.categoryIds)
      ).asArray();

      if (categoriesId) video.syncCategoryIds(categoriesId);
      if (errorsCategoriesId)
        notification.setError(
          errorsCategoriesId.map((e) => e.message),
          'categoryIds',
        );
    }

    if (input.genreIds) {
      const [genresId, errorsGenresId] = (
        await this.genresIdValidator.validate(input.genreIds)
      ).asArray();

      if (genresId) video.syncGenresId(genresId);
      if (errorsGenresId)
        notification.setError(
          errorsGenresId.map((e) => e.message),
          'genreIds',
        );
    }

    if (input.castMemberIds) {
      const [castMembersId, errorsCastMembersId] = (
        await this.castMembersIdValidator.validate(input.castMemberIds)
      ).asArray();

      if (castMembersId) video.syncCastMembersId(castMembersId);
      if (errorsCastMembersId)
        notification.setError(
          errorsCastMembersId.map((e) => e.message),
          'castMemberIds',
        );
    }

    if (video.notification.hasErrors()) {
      throw new EntityValidationError(video.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepo.update(video);
    });

    return { id: video.videoId.id };
  }
}

export type UpdateVideoOutput = { id: string };
