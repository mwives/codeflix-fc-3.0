import { CastMember } from '@core/cast-member/domain/entity/cast-member.entity';
import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { Video } from '@core/video/domain/entity/video.entity';
import { VideoOutputMapper } from './video-output';

describe('VideoOutputMapper', () => {
  describe('toOutput', () => {
    it('should convert a video in output', () => {
      const categories = Category.fake().theCategories(2).build();

      const genres = Genre.fake().theGenres(2).build();
      genres[0].syncCategoryIds([categories[0].categoryId]);
      genres[1].syncCategoryIds([categories[1].categoryId]);

      const castMembers = CastMember.fake().theCastMembers(2).build();

      const entity = Video.fake()
        .aVideoWithAllMedias()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addGenreId(genres[0].genreId)
        .addGenreId(genres[1].genreId)
        .addCastMemberId(castMembers[0].castMemberId)
        .addCastMemberId(castMembers[1].castMemberId)
        .build();

      const output = VideoOutputMapper.toOutput({
        video: entity,
        genres,
        castMembers,
        allCategoriesOfVideoAndGenre: categories,
      });
      expect(output).toEqual({
        id: entity.videoId.id,
        title: entity.title,
        description: entity.description,
        releaseYear: entity.releaseYear,
        duration: entity.duration,
        rating: entity.rating.value,
        isNewRelease: entity.isNewRelease,
        isPublished: entity.isPublished,
        categoryIds: [categories[0].categoryId.id, categories[1].categoryId.id],
        categories: [
          {
            id: categories[0].categoryId.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt,
          },
          {
            id: categories[1].categoryId.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt,
          },
        ],
        genreIds: [genres[0].genreId.id, genres[1].genreId.id],
        genres: [
          {
            id: genres[0].genreId.id,
            name: genres[0].name,
            isActive: genres[0].isActive,
            categoryIds: [categories[0].categoryId.id],
            categories: [
              {
                id: categories[0].categoryId.id,
                name: categories[0].name,
                createdAt: categories[0].createdAt,
              },
            ],
            createdAt: genres[0].createdAt,
          },
          {
            id: genres[1].genreId.id,
            name: genres[1].name,
            isActive: genres[1].isActive,
            categoryIds: [categories[1].categoryId.id],
            categories: [
              {
                id: categories[1].categoryId.id,
                name: categories[1].name,
                createdAt: categories[1].createdAt,
              },
            ],
            createdAt: genres[1].createdAt,
          },
        ],
        castMemberIds: [
          castMembers[0].castMemberId.id,
          castMembers[1].castMemberId.id,
        ],
        castMembers: [
          {
            id: castMembers[0].castMemberId.id,
            name: castMembers[0].name,
            type: castMembers[0].type.type,
            createdAt: castMembers[0].createdAt,
          },
          {
            id: castMembers[1].castMemberId.id,
            name: castMembers[1].name,
            type: castMembers[1].type.type,
            createdAt: castMembers[1].createdAt,
          },
        ],
        createdAt: entity.createdAt,
      });
    });

    describe('genreToOutput method', () => {
      it('should return an empty array if no genres match', () => {
        const video = Video.fake().aVideoWithAllMedias().build();
        const output = VideoOutputMapper['toGenreVideoOutput'](video, [], []);
        expect(output).toEqual([]);
      });

      it('should return an array of genres that match the video', () => {
        const categories = Category.fake().theCategories(2).build();

        const genres = Genre.fake().theGenres(2).build();
        genres[0].syncCategoryIds([categories[0].categoryId]);
        genres[1].syncCategoryIds([categories[1].categoryId]);

        const video = Video.fake()
          .aVideoWithAllMedias()
          .addGenreId(genres[0].genreId)
          .addGenreId(genres[1].genreId)
          .build();

        const output = VideoOutputMapper['toGenreVideoOutput'](
          video,
          genres,
          categories,
        );

        expect(output).toEqual([
          {
            id: genres[0].genreId.id,
            name: genres[0].name,
            isActive: genres[0].isActive,
            categoryIds: [categories[0].categoryId.id],
            categories: [
              {
                id: categories[0].categoryId.id,
                name: categories[0].name,
                createdAt: categories[0].createdAt,
              },
            ],
            createdAt: genres[0].createdAt,
          },
          {
            id: genres[1].genreId.id,
            name: genres[1].name,
            isActive: genres[1].isActive,
            categoryIds: [categories[1].categoryId.id],
            categories: [
              {
                id: categories[1].categoryId.id,
                name: categories[1].name,
                createdAt: categories[1].createdAt,
              },
            ],
            createdAt: genres[1].createdAt,
          },
        ]);
      });
    });
  });
});
