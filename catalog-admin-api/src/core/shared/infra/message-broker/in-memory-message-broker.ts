import { IMessageBroker } from '@core/shared/application/message-broker.interface';
import { IIntegrationEvent } from '@core/shared/domain/events/domain-event.interface';

export class InMemoryMessaging implements IMessageBroker {
  private handlers: {
    [key: string]: (event: IIntegrationEvent) => Promise<void>;
  } = {};

  async publishEvent(event: IIntegrationEvent) {
    const handler = this.handlers[event.constructor.name];
    if (handler) {
      await handler(event);
    }
  }
}
