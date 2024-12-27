import { CategoryId } from '@core/category/domain/entity/category.entity';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { Notification } from '@core/shared/domain/validators/notification';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { GenreCategoryModel, GenreModel } from './genre.model';

export class GenreModelMapper {
  static toEntity(model: GenreModel) {
    const { genreId: id, categoryIds = [], ...otherData } = model.toJSON();
    const categoriesId = categoryIds.map((c) => new CategoryId(c.categoryId));

    const notification = new Notification();
    if (!categoriesId.length) {
      notification.addError('categoryIds should not be empty', 'categoryIds');
    }

    const genre = new Genre({
      ...otherData,
      genreId: new GenreId(id),
      categoryIds: new Map(categoriesId.map((c) => [c.id, c])),
    });

    genre.validate();

    notification.copyErrors(genre.notification);

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }

    return genre;
  }

  static toModel(aggregate: Genre) {
    const { categoryIds, ...otherData } = aggregate.toJSON();
    return {
      ...otherData,
      categoryIds: categoryIds.map(
        (categoryId) =>
          new GenreCategoryModel({
            genreId: aggregate.genreId.id,
            categoryId: categoryId,
          }),
      ),
    };
  }
}
