import { RatingValues } from '@core/video/domain/entity/vo/rating.vo';
import { DataTypes, Sequelize } from 'sequelize';
import { MigrationFn } from 'umzug';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('videos', {
    video_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    release_year: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.ENUM(...Object.values(RatingValues)),
      allowNull: false,
    },
    is_new_release: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE(6),
      allowNull: false,
    },
  });
};

export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable('videos');
};
