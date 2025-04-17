import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { ServiceBusClient } from '@azure/service-bus';

import { AzureServiceBusOptions } from '../interfaces/azure-service-bus.interface';

export class AzureServiceBusStrategy extends Server implements CustomTransportStrategy {
  private client: ServiceBusClient;
  private receiver: ReturnType<ServiceBusClient['createReceiver']>;

  constructor(private readonly options: AzureServiceBusOptions) {
    super();
  }

  async listen(callback: () => void) {
    this.client = new ServiceBusClient(this.options.connectionString);
    this.receiver = this.client.createReceiver(this.options.queueName);

    this.receiver.subscribe({
      processMessage: async (message) => {
        console.log('Received message:', message);
        const handler = this.getHandlerByPattern(this.options.queueName);
        if (handler) {
          await handler(message.body);
        }
      },
      processError: async (args) => {
        console.error('Azure Service Bus Error:', args.error);
      }
    });

    callback();
  }

  async close() {
    await this.receiver.close();
    await this.client.close();
  }
}