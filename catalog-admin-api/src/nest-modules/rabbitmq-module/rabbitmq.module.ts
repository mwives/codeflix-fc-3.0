import { RabbitMQMessageBroker } from '@core/shared/infra/message-broker/rabbitmq-message-broker';
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error/rabbitmq-consume-error.filter';

export class RabbitmqModule {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('RABBITMQ_URI') as string,
            exchanges: [
              {
                name: 'dlx.exchange',
                type: 'topic',
              },
              {
                name: 'direct.delayed',
                type: 'x-delayed-message',
                options: {
                  arguments: {
                    'x-delayed-type': 'direct',
                  },
                },
              },
            ],
            queues: [
              {
                name: 'dlx.queue',
                exchange: 'dlx.exchange',
                routingKey: '#', // any routing key
                createQueueIfNotExists: true,
              },
            ],
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [RabbitmqConsumeErrorFilter],
      exports: [RabbitMQModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: 'IMessageBroker',
          useFactory: (amqpConnection: AmqpConnection) => {
            return new RabbitMQMessageBroker(amqpConnection);
          },
          inject: [AmqpConnection],
        },
      ],
      exports: ['IMessageBroker'],
    };
  }
}
