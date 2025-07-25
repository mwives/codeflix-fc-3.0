import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { NestedCastMemberConstructorProps } from '@core/cast-member/domain/nested-cast-member.entity';
import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { NestedCategoryConstructorProps } from '@core/category/domain/nested-category.entity';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { NestedGenreConstructorProps } from '@core/genre/domain/nested-genre.entity';
import { IUseCase } from '@core/shared/application/use-case-interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Rating } from '@core/video/domain/rating.vo';
import { Video, VideoId } from '@core/video/domain/video.aggregate';
import { IVideoRepository } from '@core/video/domain/video.repository';
import { SaveVideoInput } from './save-video.input';

export class SaveVideoUseCase
  implements IUseCase<SaveVideoInput, SaveVideoOutput>
{
  constructor(
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: SaveVideoInput): Promise<SaveVideoOutput> {
    const videoId = new VideoId(input.video_id);
    const video = await this.videoRepo.findById(videoId);

    return video ? this.updateVideo(input, video) : this.createVideo(input);
  }

  private async createVideo(input: SaveVideoInput) {
    const [rating, errorRating] = Rating.create(input.rating).asArray();

    if (errorRating) {
      throw new EntityValidationError([
        {
          rating: [errorRating.message],
        },
      ]);
    }

    const nestedCategoriesProps = await this.getCategoriesProps(
      input.categories_id,
    );
    const nestedGenresProps = await this.getGenresProps(input.genres_id);
    const nestedCastMembersProps = await this.getCastMembersProps(
      input.cast_members_id,
    );

    const entity = Video.create({
      video_id: new VideoId(input.video_id),
      title: input.title,
      description: input.description,
      year_launched: input.year_launched,
      duration: input.duration,
      rating,
      is_opened: input.is_opened,
      is_published: input.is_published,

      banner_url: input.banner_url,
      thumbnail_url: input.thumbnail_url,
      thumbnail_half_url: input.thumbnail_half_url,

      trailer_url: input.trailer_url,
      video_url: input.video_url,

      categories_props: nestedCategoriesProps,
      genres_props: nestedGenresProps,
      cast_members_props: nestedCastMembersProps,
      created_at: input.created_at,
    });

    if (entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.videoRepo.insert(entity);
    return { id: entity.video_id.id, created: true };
  }

  private async updateVideo(input: SaveVideoInput, video: Video) {
    if (!video) {
      throw new NotFoundError(input.video_id, Video);
    }

    video.changeTitle(input.title);
    video.changeDescription(input.description);
    video.changeYearLaunched(input.year_launched);
    video.changeDuration(input.duration);

    const [rating, errorRating] = Rating.create(input.rating).asArray();

    if (errorRating) {
      throw new EntityValidationError([
        {
          rating: [errorRating.message],
        },
      ]);
    }

    video.changeRating(rating);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    input.is_opened ? video.markAsOpened() : video.markAsNotOpened();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    input.is_published ? video.publish() : video.unpublish();

    video.replaceBannerUrl(input.banner_url);
    video.replaceThumbnailUrl(input.thumbnail_url);
    video.replaceThumbnailHalfUrl(input.thumbnail_half_url);
    video.replaceTrailerUrl(input.trailer_url);
    video.replaceVideoUrl(input.video_url);

    const nestedCategoriesProps = await this.getCategoriesProps(
      input.categories_id,
    );
    video.syncNestedCategories(nestedCategoriesProps);

    const nestedGenresProps = await this.getGenresProps(input.genres_id);
    video.syncNestedGenres(nestedGenresProps);

    const nestedCastMembersProps = await this.getCastMembersProps(
      input.cast_members_id,
    );
    video.syncNestedCastMembers(nestedCastMembersProps);

    video.changeCreatedAt(input.created_at);

    if (video.notification.hasErrors()) {
      throw new EntityValidationError(video.notification.toJSON());
    }

    await this.videoRepo.update(video);

    return { id: video.video_id.id, created: false };
  }

  private async getCategoriesProps(
    categoriesIds: string[],
  ): Promise<NestedCategoryConstructorProps[]> {
    const { exists: categoriesExists, not_exists: notCategoriesExists } =
      await this.categoryRepo
        .ignoreSoftDeleted()
        .findByIds(categoriesIds.map((c) => new CategoryId(c)));

    if (notCategoriesExists.length > 0) {
      throw new EntityValidationError([
        {
          categories_id: notCategoriesExists.map(
            (c) => new NotFoundError(c.id, Category).message,
          ),
        },
      ]);
    }

    return categoriesExists.map((c) => ({
      category_id: c.category_id,
      name: c.name,
      is_active: c.is_active,
      created_at: c.created_at,
    }));
  }

  private async getGenresProps(
    genresIds: string[],
  ): Promise<NestedGenreConstructorProps[]> {
    const { exists: genresExists, not_exists: notGenresExists } =
      await this.genreRepo
        .ignoreSoftDeleted()
        .findByIds(genresIds.map((c) => new GenreId(c)));

    if (notGenresExists.length > 0) {
      throw new EntityValidationError([
        {
          genres_id: notGenresExists.map(
            (c) => new NotFoundError(c.id, Genre).message,
          ),
        },
      ]);
    }

    return genresExists.map((g) => ({
      genre_id: g.genre_id,
      name: g.name,
      is_active: g.is_active,
      created_at: g.created_at,
    }));
  }

  private async getCastMembersProps(
    castMembersIds: string[],
  ): Promise<NestedCastMemberConstructorProps[]> {
    const { exists: castMembersExists, not_exists: notCastMembersExists } =
      await this.castMemberRepo
        .ignoreSoftDeleted()
        .findByIds(castMembersIds.map((c) => new CastMemberId(c)));

    if (notCastMembersExists.length > 0) {
      throw new EntityValidationError([
        {
          cast_members_id: notCastMembersExists.map(
            (c) => new NotFoundError(c.id, CastMember).message,
          ),
        },
      ]);
    }

    return castMembersExists.map((c) => ({
      cast_member_id: c.cast_member_id,
      name: c.name,
      type: c.type,
      created_at: c.created_at,
    }));
  }
}

export type SaveVideoOutput = { id: string; created: boolean };
