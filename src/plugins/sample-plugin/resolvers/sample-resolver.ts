import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { Sample } from '../models/sample';
import { SampleService } from '../services/sample-service';
import FunctionRegistry from '../../function-registry';

@Service()
@Resolver()
export class SampleResolver {
  constructor(@Inject(() => SampleService) private readonly sampleService: SampleService) {}

  @Query(() => [Sample])
  async samples() {
    return this.sampleService.getAllSamples();
  }

  @Mutation(() => Sample)
  async createSample(@Arg('name') name: string) {
    const sample = await this.sampleService.createSample(name);

    // Example of calling functions registered by other plugins
    const functionRegistry = FunctionRegistry.getInstance();
    const userFunctions = functionRegistry.getFunctionsOfType('user');
    userFunctions.forEach((fn) => fn());
    return sample;
  }
}
