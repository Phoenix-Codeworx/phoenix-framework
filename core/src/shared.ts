import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from './config/logger.js';
import PluginLoader from './plugins/plugin-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const loggerCtx = { context: 'shared' };

async function initializeSharedResources(pluginDirs: string[]): Promise<PluginLoader> {
  const pluginLoader = new PluginLoader();

  logger.info('Initializing shared resources', loggerCtx);

  await pluginLoader.loadPlugins(pluginDirs);
  pluginLoader.initializePlugins();

  logger.info('Shared resources initialized', loggerCtx);

  return pluginLoader;
}

async function loadPlugins(pluginsPath: string): Promise<string[]> {
  const pluginDirs: string[] = [];
  const items = readdirSync(pluginsPath);

  for (const item of items) {
    const itemPath = join(pluginsPath, item);
    if (statSync(itemPath).isDirectory()) {
      pluginDirs.push(itemPath);
    }
  }

  return pluginDirs;
}

export { initializeSharedResources };
