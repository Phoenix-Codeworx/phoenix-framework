import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { Inject, Service } from 'typedi';
import { Sample } from '../entities/sample';
import { SampleService } from '../services/sample-service';

@Service()
@Resolver()
export class SampleResolver {
  @Inject(() => SampleService)
  private readonly sampleService!: SampleService;

  @Query(() => [Sample])
  async samples() {
    return this.sampleService.getAllSamples();
  }

  @Mutation(() => Sample)
  async createSample(@Arg('name') name: string) {
    return this.sampleService.createSample(name);
  }
}
