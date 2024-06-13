import 'reflect-metadata';
import express, { type Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createSchema } from './schema';
import { connectToDatabase } from './config/database';
import { PluginLoader } from './plugins/plugin-loader';
import { samplePlugin } from './plugins/sample-plugin';
import env from './config/config';

async function startServer() {
  await connectToDatabase();

  const pluginLoader = new PluginLoader();
  pluginLoader.load(samplePlugin);

  const schema = await createSchema();

  const server = new ApolloServer({
    schema,
  });

  await server.start();

  const app: Application = express();
  server.applyMiddleware({ app });

  const port = env.PORT;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
