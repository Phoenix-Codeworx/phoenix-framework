import logger from './config/logger.js';
import { initializeSharedResources } from './shared.js';
import PluginLoader from './plugins/plugin-loader.js';

const loggerCtx = { context: 'worker' };

export async function startWorker(pluginDirs: string[], isDevMode = false) {
  let pluginLoader: PluginLoader;
  try {
    pluginLoader = await initializeSharedResources(pluginDirs);

    if (isDevMode) {
      // Additional development mode-specific logic
      logger.info('Worker running in development mode', loggerCtx);
    }

    pluginLoader.initializeQueues();

    logger.info('Worker started and ready to process jobs', loggerCtx);
  } catch (error) {
    logger.error('Failed to start worker:', error, loggerCtx);
  }
}
