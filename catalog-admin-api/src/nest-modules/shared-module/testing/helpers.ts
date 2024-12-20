import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from 'src/app.module';
import { applyGlobalConfig } from 'src/nest-modules/global-config';

export function startApp() {
  let _app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize as any);
        },
        inject: [getConnectionToken()],
      })
      .compile();

    const sequelize = module.get<Sequelize>(Sequelize);
    await sequelize.sync({ force: true });

    _app = module.createNestApplication();
    applyGlobalConfig(_app);

    await _app.init();
  });

  afterEach(async () => {
    await _app?.close();
  });

  return {
    get app() {
      return _app;
    },
  };
}
