import { Worker, Job } from 'bullmq';
import { Container } from 'typedi';
import env from '../../../config/config';
import logger from '../../../config/logger';
import { SampleService } from './sample-service';

const loggerCtx = { context: 'sample-worker' };

const sampleWorker = new Worker(
  'sampleQueue',
  async (job: Job | undefined) => {
    if (!job) {
      logger.error('Received an undefined job', loggerCtx);
      return;
    }

    const sampleService = Container.get(SampleService);
    const sampleId = job.data.sampleId;

    // Process the sample
    const sample = await sampleService.getSampleById(sampleId);
    logger.info(`Processing sample: ${sample?.name}`);
    // Add your processing logic here
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  }
);

sampleWorker.on('completed', (job: Job | undefined) => {
  if (job) {
    logger.info(`Job ${job.id} in sampleQueue completed!`, loggerCtx);
  } else {
    logger.error('Completed job is undefined', loggerCtx);
  }
});

sampleWorker.on('failed', (job: Job | undefined, err: unknown) => {
  const errorMessage = typeof err === 'string' ? err : (err instanceof Error ? err.message : JSON.stringify(err));
  if (job) {
    logger.error(`Job ${job.id} in sampleQueue failed with error: ${errorMessage}`, loggerCtx);
  } else {
    logger.error(`A job failed with error: ${errorMessage}`, loggerCtx);
  }
});

export default sampleWorker;
