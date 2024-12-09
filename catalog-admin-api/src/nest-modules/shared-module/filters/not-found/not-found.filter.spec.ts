import { Entity } from '@core/shared/domain/entity/entity';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NotFoundFilter } from './not-found.filter';

class StubEntity extends Entity {
  entityId: any;
  toJSON(): Required<any> {
    return {};
  }
}

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new NotFoundError('fake id', StubEntity);
  }
}

describe('NotFoundFilter', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new NotFoundFilter());
    await app.init();
  });

  it('should return 404 status code and error message', () => {
    return request(app.getHttpServer()).get('/stub').expect(404).expect({
      statusCode: 404,
      error: 'Not Found',
      message: 'StubEntity with id(s) fake id not found',
    });
  });
});
