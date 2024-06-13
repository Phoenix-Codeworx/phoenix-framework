import 'reflect-metadata';
import express, { type Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { connectToDatabase } from './config/database';
import { PluginLoader } from './plugins/plugin-loader';
import env from './config/config';
import logger from './config/logger';

async function startServer() {
  await connectToDatabase();

  const pluginLoader = new PluginLoader();
  pluginLoader.loadPlugins();

  const schema = await pluginLoader.createSchema();

  const server = new ApolloServer({
    schema,
  });

  await server.start();

  const app: Application = express();
  server.applyMiddleware({ app });

  const port = env.PORT;
  app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}${server.graphqlPath}`, { context: 'server' });
  });
}

startServer();
