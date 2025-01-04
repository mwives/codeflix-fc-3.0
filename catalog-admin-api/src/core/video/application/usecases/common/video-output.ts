import { CastMemberTypes } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { Video } from '@core/video/domain/entity/video.entity';
import { RatingValues } from '@core/video/domain/entity/vo/rating.vo';

export type VideoCategoryOutput = {
  id: string;
  name: string;
  createdAt: Date;
};

export type VideoGenreOutput = {
  id: string;
  name: string;
  isActive: boolean;
  categoryIds: string[];
  categories: { id: string; name: string; createdAt: Date }[];
  createdAt: Date;
};

export type VideoCastMemberOutput = {
  id: string;
  name: string;
  type: CastMemberTypes;
  createdAt: Date;
};

export type VideoOutput = {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: RatingValues;
  isNewRelease: boolean;
  isPublished: boolean;
  categoryIds: string[];
  categories: VideoCategoryOutput[];
  genreIds: string[];
  genres: VideoGenreOutput[];
  castMemberIds: string[];
  castMembers: VideoCastMemberOutput[];
  createdAt: Date;
};

export type VideoOutputParams = {
  video: Video;
  allCategoriesOfVideoAndGenre: Category[];
  genres: Genre[];
  castMembers: CastMember[];
};

export class VideoOutputMapper {
  static toOutput({
    video,
    allCategoriesOfVideoAndGenre,
    genres,
    castMembers,
  }: VideoOutputParams): VideoOutput {
    return {
      id: video.videoId.id,
      title: video.title,
      description: video.description,
      releaseYear: video.releaseYear,
      duration: video.duration,
      rating: video.rating.value,
      isNewRelease: video.isNewRelease,
      isPublished: video.isPublished,
      categoryIds: Array.from(video.categoryIds.values()).map((c) => c.id),
      categories: allCategoriesOfVideoAndGenre
        .filter((c) => video.categoryIds.has(c.categoryId.id))
        .map((c) => ({
          id: c.categoryId.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
      genreIds: Array.from(video.genreIds.values()).map((g) => g.id),
      genres: VideoOutputMapper.toGenreVideoOutput(
        video,
        genres,
        allCategoriesOfVideoAndGenre,
      ),
      castMemberIds: Array.from(video.castMemberIds.values()).map((c) => c.id),
      castMembers: castMembers
        .filter((c) => video.castMemberIds.has(c.castMemberId.id))
        .map((c) => ({
          id: c.castMemberId.id,
          name: c.name,
          type: c.type.type,
          createdAt: c.createdAt,
        })),
      createdAt: video.createdAt,
    };
  }

  private static toGenreVideoOutput(
    video: Video,
    genres: Genre[],
    categories: Category[],
  ) {
    return genres
      .filter((g) => video.genreIds.has(g.genreId.id))
      .map((g) => ({
        id: g.genreId.id,
        name: g.name,
        isActive: g.isActive,
        categoryIds: Array.from(g.categoryIds.values()).map((c) => c.id),
        categories: categories
          .filter((c) => g.categoryIds.has(c.categoryId.id))
          .map((c) => ({
            id: c.categoryId.id,
            name: c.name,
            createdAt: c.createdAt,
          })),
        createdAt: g.createdAt,
      }));
  }
}
