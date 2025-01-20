import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel } from 'amqp-connection-manager';

@Injectable()
export class CreateDlxQueueService implements OnModuleInit {
  constructor(private amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    await this.createDlxQueue();
  }

  async createDlxQueue() {
    const channelWrapper =
      this.amqpConnection.managedConnection.createChannel();

    await channelWrapper.addSetup((channel: Channel) => {
      return Promise.all([
        channel.assertExchange('dlx.exchange', 'topic'),
        channel.assertQueue('dlx.queue'),
        channel.bindQueue('dlx.queue', 'dlx.exchange', '#'),
      ]);
    });

    await channelWrapper.close();
  }
}
