import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import PluginLoader from '../src/plugins/plugin-loader'; // Adjust the path as needed
import { setMongoServer } from './teardown';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

let server: ApolloServer;
let app: express.Application;

export const setup = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  const pluginLoader = new PluginLoader();
  pluginLoader.loadPlugins();
  pluginLoader.initializePlugins();

  const schema = await pluginLoader.createSchema();
  pluginLoader.registerModels();

  app = express();

  server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      let user = null;
      const authHeader = req.headers.authorization || '';
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          const UserModel = mongoose.model('User'); // Access the User model dynamically
          user = await UserModel.findById(decoded.id);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      // Mock enforcer for testing purposes
      const enforcer = {
        enforce: (action: string, resource: string) => {
          return true; // Allow all actions for testing
        },
      };

      return {
        ...pluginLoader.context,
        req,
        user,
        enforcer,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  setMongoServer(mongoServer);

  return app;
};
