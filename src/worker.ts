
import logger from './config/logger';
import { initializeSharedResources } from './shared';
import type PluginLoader from './plugins/plugin-loader';

const loggerCtx = { context: 'worker' };

export async function startWorker(pluginLoader: PluginLoader, isDevMode = false) {
  try {
    if (!isDevMode) {
      pluginLoader = await initializeSharedResources();
    }

    pluginLoader.initializeQueues();

    logger.info('Worker started and ready to process jobs', loggerCtx);
  } catch (error) {
    logger.error('Failed to start worker:', error, loggerCtx);
  }
}
