import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { DataType } from 'sequelize-typescript';
import { AudioVideoMediaModel } from './audio-video-media.model';
import { ImageMediaModel } from './image-media.model';
import { setupSequelizeForVideo } from './testing/helpers';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from './video.model';

describe('VideoCategoryModel', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoCategoryModel.tableName).toBe('category_video');
  });

  test('mapping props', () => {
    const attributesMap = VideoCategoryModel.getAttributes();
    const attributes = Object.keys(VideoCategoryModel.getAttributes());
    expect(attributes).toStrictEqual(['videoId', 'categoryId']);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
      unique: 'category_video_videoId_categoryId_unique',
    });

    const categoryIdAttr = attributesMap.categoryId;
    expect(categoryIdAttr).toMatchObject({
      field: 'category_id',
      fieldName: 'categoryId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'categories',
        key: 'category_id',
      },
      unique: 'category_video_videoId_categoryId_unique',
    });
  });
});

describe('VideoGenreModel', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoGenreModel.tableName).toBe('genre_video');
  });

  test('mapping props', () => {
    const attributesMap = VideoGenreModel.getAttributes();
    const attributes = Object.keys(VideoGenreModel.getAttributes());
    expect(attributes).toStrictEqual(['videoId', 'genreId']);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
      unique: 'genre_video_videoId_genreId_unique',
    });

    const genreIdAttr = attributesMap.genreId;
    expect(genreIdAttr).toMatchObject({
      field: 'genre_id',
      fieldName: 'genreId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'genres',
        key: 'genre_id',
      },
      unique: 'genre_video_videoId_genreId_unique',
    });
  });
});

describe('VideoCastMemberModel', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoCastMemberModel.tableName).toBe('cast_member_video');
  });

  test('mapping props', () => {
    const attributesMap = VideoCastMemberModel.getAttributes();
    const attributes = Object.keys(VideoCastMemberModel.getAttributes());
    expect(attributes).toStrictEqual(['videoId', 'castMemberId']);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'videos',
        key: 'video_id',
      },
      unique: 'cast_member_video_videoId_castMemberId_unique',
    });

    const castMemberIdAttr = attributesMap.castMemberId;
    expect(castMemberIdAttr).toMatchObject({
      field: 'cast_member_id',
      fieldName: 'castMemberId',
      primaryKey: true,
      type: DataType.UUID(),
      references: {
        model: 'cast_members',
        key: 'cast_member_id',
      },
      unique: 'cast_member_video_videoId_castMemberId_unique',
    });
  });
});

describe('VideoModel', () => {
  setupSequelizeForVideo();

  test('table name', () => {
    expect(VideoModel.tableName).toBe('videos');
  });

  test('mapping props', () => {
    const attributesMap = VideoModel.getAttributes();
    const attributes = Object.keys(VideoModel.getAttributes());
    expect(attributes).toStrictEqual([
      'videoId',
      'title',
      'description',
      'releaseYear',
      'duration',
      'rating',
      'isNewRelease',
      'isPublished',
      'createdAt',
    ]);

    const videoIdAttr = attributesMap.videoId;
    expect(videoIdAttr).toMatchObject({
      field: 'video_id',
      fieldName: 'videoId',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const titleAttr = attributesMap.title;
    expect(titleAttr).toMatchObject({
      field: 'title',
      fieldName: 'title',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const descriptionAttr = attributesMap.description;
    expect(descriptionAttr).toMatchObject({
      field: 'description',
      fieldName: 'description',
      allowNull: false,
      type: DataType.TEXT(),
    });

    const yearLaunchedAttr = attributesMap.releaseYear;
    expect(yearLaunchedAttr).toMatchObject({
      field: 'release_year',
      fieldName: 'releaseYear',
      allowNull: false,
      type: DataType.INTEGER(),
    });

    const isOpenedAttr = attributesMap.isNewRelease;
    expect(isOpenedAttr).toMatchObject({
      field: 'is_new_release',
      fieldName: 'isNewRelease',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const isPublishedAttr = attributesMap.isPublished;
    expect(isPublishedAttr).toMatchObject({
      field: 'is_published',
      fieldName: 'isPublished',
      allowNull: false,
      type: DataType.BOOLEAN(),
    });

    const ratingAttr = attributesMap.rating;
    expect(ratingAttr).toMatchObject({
      field: 'rating',
      fieldName: 'rating',
      allowNull: false,
      type: DataType.ENUM('L', '10', '12', '14', '16', '18'),
    });

    const durationAttr = attributesMap.duration;
    expect(durationAttr).toMatchObject({
      field: 'duration',
      fieldName: 'duration',
      allowNull: false,
      type: DataType.INTEGER(),
    });

    const createdAtAttr = attributesMap.createdAt;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'createdAt',
      allowNull: false,
      type: DataType.DATE(6),
    });
  });

  test('mapping associations', () => {
    const associationsMap = VideoModel.associations;
    const associations = Object.keys(associationsMap);
    expect(associations).toStrictEqual([
      'imageMedias',
      'audioVideoMedias',
      'categoryIds',
      'categories',
      'genreIds',
      'genres',
      'castMemberIds',
      'castMembers',
    ]);

    const imageMediasAttr = associationsMap.imageMedias;
    expect(imageMediasAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: ImageMediaModel,
      associationType: 'HasMany',
      options: {
        foreignKey: {
          name: 'videoId',
        },
      },
    });

    const audioVideoMediasAttr = associationsMap.audioVideoMedias;
    expect(audioVideoMediasAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: AudioVideoMediaModel,
      associationType: 'HasMany',
      options: {
        foreignKey: {
          name: 'videoId',
        },
      },
    });

    const categoriesIdAttr = associationsMap.categoryIds;
    expect(categoriesIdAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: VideoCategoryModel,
      associationType: 'HasMany',
      options: {
        foreignKey: { name: 'videoId' },
        as: 'categoryIds',
      },
    });

    const categoriesRelation = associationsMap.categories;
    expect(categoriesRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: VideoModel,
      target: CategoryModel,
      options: {
        through: { model: VideoCategoryModel },
        foreignKey: { name: 'videoId' },
        otherKey: { name: 'categoryId' },
        as: 'categories',
      },
    });

    const genresIdAttr = associationsMap.genreIds;
    expect(genresIdAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: VideoGenreModel,
      associationType: 'HasMany',
      options: {
        foreignKey: { name: 'videoId' },
        as: 'genreIds',
      },
    });

    const genresRelation = associationsMap.genres;
    expect(genresRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: VideoModel,
      target: GenreModel,
      options: {
        through: { model: VideoGenreModel },
        foreignKey: { name: 'videoId' },
        otherKey: { name: 'genreId' },
        as: 'genres',
      },
    });

    const castMembersIdAttr = associationsMap.castMemberIds;
    expect(castMembersIdAttr).toMatchObject({
      foreignKey: 'videoId',
      source: VideoModel,
      target: VideoCastMemberModel,
      associationType: 'HasMany',
      options: {
        foreignKey: { name: 'videoId' },
        as: 'castMemberIds',
      },
    });

    const castMembersRelation = associationsMap.castMembers;
    expect(castMembersRelation).toMatchObject({
      associationType: 'BelongsToMany',
      source: VideoModel,
      target: CastMemberModel,
      options: {
        through: { model: VideoCastMemberModel },
        foreignKey: { name: 'videoId' },
        otherKey: { name: 'castMemberId' },
        as: 'castMembers',
      },
    });
  });
});
