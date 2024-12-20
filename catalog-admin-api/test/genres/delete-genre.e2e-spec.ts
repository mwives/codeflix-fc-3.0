import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  describe('DELETE /delete/:id', () => {
    const nestApp = startApp();

    it('should delete genre', async () => {
      const genreRepository = nestApp.app.get<IGenreRepository>(
        GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      );
      const categoryRepository = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();

      await genreRepository.insert(genre);

      await request(nestApp.app.getHttpServer())
        .delete(`/genres/${genre.genreId.id}`)
        .expect(204);

      await expect(genreRepository.findById(genre.genreId)).resolves.toBeNull();
    });

    describe('should return 404 when genre not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Genre with id(s) 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .delete(`/genres/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });
  });
});
