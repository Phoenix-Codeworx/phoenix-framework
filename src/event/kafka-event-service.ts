import { Kafka, type Producer, type Consumer } from 'kafkajs';
import { Container, Service } from 'typedi';

@Service()
class KafkaEventService {
  private kafka: Kafka;
  private readonly producer: Producer;
  private readonly consumer: Consumer;
  private eventHandlers: { [key: string]: ((message: any) => void)[] } = {};
  private topics: string[] = [];

  constructor() {
    this.kafka = new Kafka({
      clientId: 'my-app',
      brokers: [process.env.KAFKA_BROKER || 'localhost:29092'], // Use environment variable or default to localhost
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'sample-group' });

    this.initialize();
  }

  private async initialize() {
    await this.retryConnect(this.producer.connect.bind(this.producer), 5);
    await this.retryConnect(this.consumer.connect.bind(this.consumer), 5);

    for (const topic of this.topics) {
      await this.consumer.subscribe({ topic, fromBeginning: true });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value) {
          const handlers = this.eventHandlers[topic] || [];
          const parsedMessage = JSON.parse(message.value.toString());
          handlers.forEach(handler => handler(parsedMessage));
        }
      },
    });
  }

  private async retryConnect(connectFn: () => Promise<void>, retries: number) {
    for (let i = 0; i < retries; i++) {
      try {
        await connectFn();
        return;
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Connection attempt ${i + 1} failed: ${err.message}`);
        } else {
          console.error(`Connection attempt ${i + 1} failed: ${err}`);
        }
        if (i === retries - 1) throw err;
        await new Promise(res => setTimeout(res, 2000)); // Wait for 2 seconds before retrying
      }
    }
  }

  registerTopic(topic: string) {
    if (!this.topics.includes(topic)) {
      this.topics.push(topic);
    }
  }

  async emitEvent(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  subscribeToEvent(topic: string, handler: (message: any) => void) {
    if (!this.eventHandlers[topic]) {
      this.eventHandlers[topic] = [];
    }
    this.eventHandlers[topic].push(handler);
  }
}

// Register the service with typedi
Container.set(KafkaEventService, new KafkaEventService());

export default KafkaEventService;
