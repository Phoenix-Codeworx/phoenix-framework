import { connectToDatabase } from './config/database';
import logger from './config/logger';
import { initEnforcer } from './rbac';
import { bootstrap } from './plugins/auth-plugin/bootstrap';
import PluginLoader from './plugins/plugin-loader';

const loggerCtx = { context: 'worker' };

export async function startWorker() {
  try {
    await connectToDatabase();
    await initEnforcer(); // Initialize Casbin
    await bootstrap(); // Bootstrap the application with a superuser

    const pluginLoader = new PluginLoader();
    pluginLoader.loadPlugins();

    // Register models before initializing plugins
    pluginLoader.registerModels();

    // Initialize plugins (extend models and resolvers)
    pluginLoader.initializePlugins();

    // Initialize queues
    pluginLoader.initializeQueues();

    logger.info('Worker started and ready to process jobs', loggerCtx);
  } catch (error) {
    logger.error('Failed to start worker:', error, loggerCtx);
  }
}
