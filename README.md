<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center"><a href="https://nestjs.com" target="_blank">NestJs</a> custom transport for <a href="https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview" target="_blank">Azure Service Bus</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~luis199230" target="_blank"><img src="https://img.shields.io/npm/v/@madeweb/nestjs-service-bus.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~luis199230" target="_blank"><img src="https://img.shields.io/npm/l/@madeweb/nestjs-service-bus.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~luis199230" target="_blank"><img src="https://img.shields.io/npm/dm/@madeweb/nestjs-service-bus.svg" alt="NPM Downloads" /></a>
</p>

## Description

<a href="https://azure.microsoft.com/en-us/services/service-bus/#overview" target="_blank">Azure Service Bus</a> is a fully managed enterprise message broker with message queues. Service Bus is used to decouple applications and services from each other, providing the following benefits:

- Load-balancing work across competing workers
- Safely routing and transferring data and control across service and application boundaries
- Coordinating transactional work that requires a high-degree of reliability

#### Installation

To start building Azure Service Bus-based microservices, first install the required packages:

```bash
$ npm i --save @azure/service-bus @madeweb/nestjs-service-bus
```
#### Overview

To use the Azure Service Bus strategy, pass the following options object to the `createMicroservice()` method:

```typescript
//  main.ts

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  strategy: new AzureServiceBusServer({
    connectionString: 'Endpoint=sb://<Name>.servicebus.windows.net/;SharedAccessKeyName=<SharedAccessKeyName>;SharedAccessKey=<SharedAccessKey>',
    queueName: 'sample-queue',
  }),
});

```
#### Options

The <strong>Azure Service Bus</strong> strategy exposes the properties described below.

<table>
  <tr>
    <td><code>retryOptions</code></td>
    <td>Retry policy options that determine the mode, number of retries, retry interval etc (read more <a href="https://docs.microsoft.com/en-us/javascript/api/@azure/service-bus/servicebusclientoptions?view=azure-node-latest#@azure-service-bus-servicebusclientoptions-retryoptions" rel="nofollow" target="_blank">here</a>).</td>
  </tr>
  <tr>
    <td><code>webSocketOptions</code></td>
    <td>Options to configure the channelling of the AMQP connection over Web Sockets (read more <a href="https://docs.microsoft.com/en-us/javascript/api/@azure/service-bus/servicebusclientoptions?view=azure-node-latest#@azure-service-bus-servicebusclientoptions-websocketoptions" rel="nofollow" target="_blank">here</a>).</td>
  </tr>
  <tr>
    <td><code>userAgentOptions</code></td>
    <td>Options for adding user agent details to outgoing requests (read more <a href="https://docs.microsoft.com/en-us/javascript/api/@azure/service-bus/servicebusclientoptions?view=azure-node-latest#@azure-service-bus-servicebusclientoptions-useragentoptions" rel="nofollow" target="_blank">here</a>).</td>
  </tr>
</table>


#### Usage

Add the following code to your main.ts file:

```typescript
async function bootstrapAzureServiceBus(app: INestApplication): Promise<void> {
  const serviceBusConnection = process.env.AZURE_SERVICE_BUS_CONNECTION;

  if (serviceBusConnection) {
    app.connectMicroservice<CustomStrategy>({
      strategy: new AzureServiceBusStrategy({
        connectionString: serviceBusConnection,
        queueName: process.env.AZURE_SERVICE_BUS_DOWNLOAD_QUEUE,
      }),
    });

    await app.startAllMicroservices();
  }
}
```

#### Producer

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AzureServiceBusClient } from '@madeweb/nestjs-service-bus';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnyQueueService {
  private client: AzureServiceBusClient;
  private queueName: string;

  constructor(private readonly configService: ConfigService) {
    this.queueName = this.configService.get<string>(
      'azureServiceBus.queueName',
    );
    this.client = new AzureServiceBusClient(
      this.configService.get('azureServiceBus'),
    );
  }

  public async sendMessage(body: string) {
    await this.client.connect();
    await firstValueFrom(this.client.emit(this.queueName, body));
  }
}

```

##### Consumer

To access the original Azure Service Bus message use the `@MessagePattern` decorator as follows:


```typescript

 @MessagePattern('AzureServiceBus')
  async handleMessage(@Payload() data: string) {
    console.log(`Received message: ${data}`);
  }

```

Options

<table>
  <tr>
    <td><code>receiveMode</code></td>
    <td>Represents the receive mode for the receiver. (read more <a href="https://docs.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement#peeklock" rel="nofollow" target="_blank">here</a>).</td>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td>Options used when subscribing to a Service Bus queue.</td>
  </tr>
</table>



## Security concerns and contributions

* Author - [Luis Benavides](https://github.com/luis199230)

## License
Nestjs Azure Service Bus is [MIT licensed](LICENSE).