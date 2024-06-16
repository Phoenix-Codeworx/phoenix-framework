// src/services/sample-service.ts
import { Service } from 'typedi';
import { Sample, SampleModel } from '../models/sample';
import KafkaEventService from '../../../event/kafka-event-service';

@Service()
export class SampleService {
  constructor(private eventService: KafkaEventService) {}

  async getAllSamples(): Promise<Sample[]> {
    return SampleModel.find().exec();
  }

  async createSample(name: string): Promise<Sample> {
    const sample = new SampleModel({ name });
    const savedSample = await sample.save();
    await this.eventService.emitEvent('sampleCreated', savedSample); // Emit event using the centralized service
    return savedSample;
  }
}
