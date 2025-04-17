import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { ServiceBusClient } from '@azure/service-bus';

import { AzureServiceBusOptions } from '../interfaces/azure-service-bus.interface';

export class AzureServiceBusClient extends ClientProxy {
  private client: ServiceBusClient;

  constructor(private readonly options: AzureServiceBusOptions) {
    super();
    this.client = new ServiceBusClient(this.options.connectionString);
  }

  async connect(): Promise<any> {
    return Promise.resolve();
  }

  async close() {
    await this.client.close();
  }

  async dispatchEvent<T>(packet: ReadPacket<T>): Promise<T> {
    const sender = this.client.createSender(this.options.queueName);
    await sender.sendMessages({
      body: packet.data,
    });
    await sender.close();
    return Promise.resolve(packet.data);
  }

  publish<T>(packet: ReadPacket<T>, callback: (packet: WritePacket<T>) => void): () => void {
    (async () => {
      try {
        const sender = this.client.createSender(this.options.queueName);
        await sender.sendMessages({
          body: packet.data,
        });
        await sender.close();
        callback({ response: packet.data });
      } catch (err) {
        callback({ err });
      }
    })();
    return () => {};
  }
}