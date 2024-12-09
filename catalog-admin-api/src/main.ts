import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { EntityValidationFilter } from './nest-modules/shared-module/filters/entity-validation/entity-validation.filter';
import { NotFoundFilter } from './nest-modules/shared-module/filters/not-found/not-found.filter';
import { WrapperDataInterceptor } from './nest-modules/shared-module/interceptors/wrapper-data/wrapper-data.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new WrapperDataInterceptor());
  app.useGlobalFilters(new NotFoundFilter(), new EntityValidationFilter());

  await app.listen(3000);
}
bootstrap();
