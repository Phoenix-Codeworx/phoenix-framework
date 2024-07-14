import { Container } from 'typedi';
import { getModelForClass } from '@typegoose/typegoose';
import { type GlobalContext } from '@phoenix-framework/core/src/plugins/global-context.js';
import logger from '@phoenix-framework/core/src/config/logger.js';
import { Sample } from './models/sample';
import { SampleResolver } from './resolvers/sample-resolver';
import { SampleService } from './services/sample-service';
import { KafkaEventService } from '@phoenix-framework/core/src/event/kafka-event-service.js';
import { Queue, Job } from 'bullmq';

const loggerCtx = { context: 'sample-plugin/index' };

const sampleJobProcessor = async (job: Job) => {
  logger.info(`Processing job ${job.id}`, loggerCtx);
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
    const eventService = container.get(KafkaEventService); // Ensure KafkaEventService is registered
    container.set(SampleService, new SampleService(eventService, sampleQueue));

    // Ensure SampleResolver is added to context resolvers
    context.resolvers['Sample'] = [SampleResolver];

    // Register the topic with KafkaEventService
    eventService.registerTopic('sampleCreated');

    // Set up event handlers using the centralized event service
    eventService.subscribeToEvent('sampleCreated', (sample) => {
      logger.debug('Received sampleCreated event:', sample);
      logger.info(`Sample created: ${sample}`, loggerCtx);
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
