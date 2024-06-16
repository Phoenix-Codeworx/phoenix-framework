import { Container } from 'typedi';
import { getModelForClass } from '@typegoose/typegoose';
import { type GlobalContext } from '../global-context';
import { Sample } from './models/sample';
import { SampleResolver } from './resolvers/sample-resolver';
import { SampleService } from './services/sample-service';
import KafkaEventService from '../../event/kafka-event-service';

export default {
  name: 'sample-plugin',
  type: 'demonstration',
  resolvers: [SampleResolver],
  register(container: typeof Container, context: GlobalContext) {
    const SampleModel = getModelForClass(Sample);
    context.models['Sample'] = { schema: SampleModel.schema, model: SampleModel };
    container.set('SampleModel', SampleModel);

    // Register SampleService and KafkaEventService with typedi
    container.set(SampleService, new SampleService(Container.get(KafkaEventService)));

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
  },
};
