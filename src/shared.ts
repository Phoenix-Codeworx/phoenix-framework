// src/shared.ts
import { connectToDatabase } from './config/database';
import { initEnforcer } from './rbac';
import { bootstrap } from './plugins/auth-plugin/bootstrap';
import PluginLoader from './plugins/plugin-loader';
import logger from './config/logger';

const loggerCtx = { context: 'shared' };

export async function initializeSharedResources() {
  await connectToDatabase();
  await initEnforcer(); // Initialize Casbin
  await bootstrap(); // Bootstrap the application with a superuser

  const pluginLoader = new PluginLoader();
  pluginLoader.loadPlugins();

  // Register models before initializing plugins
  pluginLoader.registerModels();

  // Initialize plugins (extend models and resolvers)
  pluginLoader.initializePlugins();

  return pluginLoader;
}
