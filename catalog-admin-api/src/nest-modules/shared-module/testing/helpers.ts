import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from 'src/app.module';
import { applyGlobalConfig } from 'src/nest-modules/global-config';

export function startApp() {
  let _app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const sequelize = module.get<Sequelize>(Sequelize);
    await sequelize.sync({ force: true });

    _app = module.createNestApplication();
    applyGlobalConfig(_app);

    await _app.init();
  });

  afterAll(async () => {
    await _app?.close();
  });

  return {
    get app() {
      return _app;
    },
  };
}
