import dotenv from 'dotenv';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '@phoenix-framework/core/src/config/logger.js';
import { startApp } from '@phoenix-framework/core/src/server.js';
import packageJson from '../package.json' assert { type: 'json' };

// Resolve the path to the .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function loadPlugins(): Promise<string[]> {
  const pluginDirs: string[] = [];
  const pluginsPath = join(__dirname, 'plugins');
  const items = readdirSync(pluginsPath);

  for (const item of items) {
    const itemPath = join(pluginsPath, item);
    if (statSync(itemPath).isDirectory()) {
      pluginDirs.push(itemPath);
    }
  }

  return pluginDirs;
}

async function runApp() {
  try {
    const pluginDirs = await loadPlugins();
    await startApp(pluginDirs); // Pass the plugin directories to the core's startApp
    logger.info(`Server started, version ${packageJson.version}`, 'exampleApp-index');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

runApp();
