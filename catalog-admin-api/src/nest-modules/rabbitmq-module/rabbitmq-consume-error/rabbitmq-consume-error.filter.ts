import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Nack } from '@golevelup/nestjs-rabbitmq';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';

@Catch()
export class RabbitmqConsumeErrorFilter<T> implements ExceptionFilter {
  static readonly NON_RECOVERABLE_ERRORS = [
    NotFoundError,
    EntityValidationError,
    UnprocessableEntityException,
  ];

  catch(exception: T, host: ArgumentsHost) {
    if (host.getType<'rmq'>() !== 'rmq') {
      return;
    }

    const canRetryError =
      RabbitmqConsumeErrorFilter.NON_RECOVERABLE_ERRORS.some(
        (error) => exception instanceof error,
      );

    if (canRetryError) {
      return new Nack(false);
    }
  }
}
