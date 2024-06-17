import { Container } from 'typedi';
import { getModelForClass } from '@typegoose/typegoose';
import { type GlobalContext } from '../global-context';
import { Sample } from './models/sample';
import { SampleResolver } from './resolvers/sample-resolver';
import { SampleService } from './services/sample-service';
import KafkaEventService from '../../event/kafka-event-service';
import { Queue, Job } from 'bullmq';

const sampleJobProcessor = async (job: Job) => {
  console.log(`Processing job ${job.id}`);
  // Add job processing logic here
};

export default {
  name: 'sample-plugin',
  type: 'demonstration',
  resolvers: [SampleResolver],
  register(container: typeof Container, context: GlobalContext) {
    const SampleModel = getModelForClass(Sample);
    context.models['Sample'] = { schema: SampleModel.schema, model: SampleModel };
    container.set('SampleModel', SampleModel);

    // Define and register the queue for this plugin
    const sampleQueue = new Queue('sampleQueue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });

    // Register sampleQueue in the container
    container.set('sampleQueue', sampleQueue);

    // Register SampleService and KafkaEventService with typedi
    container.set(SampleService, new SampleService(Container.get(KafkaEventService), sampleQueue));

    // Ensure SampleResolver is added to context resolvers
    context.resolvers['Sample'] = [SampleResolver];

    // Register the topic with KafkaEventService
    const eventService = Container.get(KafkaEventService);
    eventService.registerTopic('sampleCreated');

    // Set up event handlers using the centralized event service
    eventService.subscribeToEvent('sampleCreated', (sample) => {
      console.log('Sample created:', sample);
      // Additional handling logic here
    });

    context.queues['sampleQueue'] = {
      processor: sampleJobProcessor,
      options: {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    };
  },
};
