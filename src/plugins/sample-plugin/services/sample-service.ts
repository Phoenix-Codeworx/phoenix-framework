import { Service } from 'typedi';
import { Sample, SampleModel } from '../entities/sample';

@Service()
export class SampleService {
  async getAllSamples(): Promise<Sample[]> {
    return SampleModel.find().exec();
  }

  async createSample(name: string): Promise<Sample> {
    const sample = new SampleModel({ name });
    return sample.save();
  }
}
