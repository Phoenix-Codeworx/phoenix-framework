import { Service } from 'typedi';
import { Sample, SampleModel } from '../models/sample';
import { KafkaEventService } from '@phoenix-framework/core/src/event/kafka-event-service.js';
import { Queue } from 'bullmq';
import logger from '@phoenix-framework/core/src/config/logger.js';

@Service()
export class SampleService {
  constructor(
    private eventService: KafkaEventService,
    private sampleQueue: Queue
  ) {}

  async getAllSamples(): Promise<Sample[]> {
    return SampleModel.find().exec();
  }

  async createSample(name: string): Promise<Sample> {
    const sample = new SampleModel({ name });
    const savedSample = await sample.save();
    logger.debug('emitting sampleCreated event:', savedSample);
    await this.eventService.emitEvent('sampleCreated', savedSample); // Emit event using the centralized service

    // Add job to the sampleQueue
    await this.sampleQueue.add('processSample', { sampleId: savedSample.id });

    return savedSample;
  }

  async getSampleById(id: string): Promise<Sample | null> {
    return SampleModel.findById(id).exec();
  }
}
