import { CastMembersStorageValidator } from '@core/cast-member/application/validations/cast-member-storage.validator';
import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { GenresIdStorageValidator } from '@core/genre/application/validations/genre-id-storage.validator';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Video } from '@core/video/domain/entity/video.entity';
import { Rating } from '@core/video/domain/entity/vo/rating.vo';
import { IVideoRepository } from '@core/video/domain/repository/video.repository';
import { CreateVideoInput } from './create-video.input';

export class CreateVideoUseCase
  implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private categoryIdStorageValidator: CategoryIdStorageValidator,
    private GenresIdStorageValidator: GenresIdStorageValidator,
    private castMembersStorageValidator: CastMembersStorageValidator,
  ) {}

  async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
    const [rating, errorRating] = Rating.create(input.rating).asArray();

    const [eitherCategoriesId, eitherGenresId, eitherCastMembers] =
      await Promise.all([
        await this.categoryIdStorageValidator.validate(input.categoryIds),
        await this.GenresIdStorageValidator.validate(input.genreIds),
        await this.castMembersStorageValidator.validate(input.castMemberIds),
      ]);

    const [categoriesId, errorsCategoriesId] = eitherCategoriesId.asArray();
    const [genresId, errorsGenresId] = eitherGenresId.asArray();
    const [castMembersId, errorsCastMembersId] = eitherCastMembers.asArray();

    const video = Video.create({
      ...input,
      rating,
      categoryIds: errorsCategoriesId ? [] : categoriesId,
      genreIds: errorsGenresId ? [] : genresId,
      castMemberIds: errorsCastMembersId ? [] : castMembersId,
    });

    const notification = video.notification;

    if (errorsCategoriesId) {
      notification.setError(
        errorsCategoriesId.map((e) => e.message),
        'categoryIds',
      );
    }

    if (errorsGenresId) {
      notification.setError(
        errorsGenresId.map((e) => e.message),
        'genreIds',
      );
    }

    if (errorsCastMembersId) {
      notification.setError(
        errorsCastMembersId.map((e) => e.message),
        'castMemberIds',
      );
    }

    if (errorRating) {
      notification.setError(errorRating.message, 'rating');
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.videoRepo.insert(video);
    });

    return { id: video.videoId.id };
  }
}

export type CreateVideoOutput = { id: string };
