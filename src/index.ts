import 'reflect-metadata';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import { ApolloServer } from 'apollo-server-express';
import env from './config/config';
import logger from './config/logger';
import { authenticate } from './middleware/auth';
import { isIntrospectionQuery } from './utils/introspection-check';
import { shouldBypassAuth } from './utils/should-bypass-auth';
import sanitizeLog from './sanitize-log';
import { initializeSharedResources } from './shared';
import { startWorker } from './worker';
import { getEnforcer } from './rbac.ts';
import type PluginLoader from './plugins/plugin-loader.ts';

const loggerCtx = { context: 'index' };

async function startServer(pluginLoader: PluginLoader) {
  try {
    const schema = await pluginLoader.createSchema();

    const server = new ApolloServer({
      schema,
      introspection: true, // Ensure introspection is enabled
      context: async ({ req }) => ({
        user: req.user, // User object from middleware
        enforcer: await getEnforcer(), // Casbin enforcer instance
        pluginsContext: pluginLoader.context, // Add the global context here
      }),
    });

    await server.start();

    const app: Application = express();

    app.use(express.json());

    // Middleware to conditionally authenticate user and set user context
    app.use('/graphql', (req: Request, res: Response, next: NextFunction) => {
      const reqInfo = {
        url: req.url,
        method: req.method,
        ip: req.ip,
        headers: req.headers,
        operation: {},
      };

      if (req.body && req.body.query) {
        if (isIntrospectionQuery(req.body.query)) {
          logger.verbose('Bypassing authentication for introspection query', loggerCtx);
          return next(); // Bypass authentication for introspection queries
        }

        if (shouldBypassAuth(req.body.query)) {
          logger.verbose(`Bypassing authentication due to excluded operation`, loggerCtx);
          return next(); // Bypass authentication for this request
        }

        try {
          // If no operation bypasses authentication, apply authentication middleware
          authenticate(req, res, next);
        } catch (error) {
          logger.error('Error parsing GraphQL query:', { error, query: req.body.query });
          authenticate(req, res, next);
        }
      } else {
        // If there is no query in the request body, continue with authentication
        authenticate(req, res, next);
      }
      const sanitizedReqInfo = sanitizeLog(reqInfo);
      const logLine = JSON.stringify(sanitizedReqInfo, null, 0);
      logger.verbose(`reqInfo: ${logLine}`, loggerCtx);
    });

    server.applyMiddleware({ app });

    const port = env.PORT;
    app.listen(port, () => {
      logger.info(`Server is running at http://localhost:${port}${server.graphqlPath}`, { context: 'index' });
    });
  } catch (error) {
    logger.error('Failed to start server:', error, loggerCtx);
  }
}

async function startApp() {
  const pluginLoader = await initializeSharedResources();

  switch (env.MODE) {
    case 'server':
      await startServer(pluginLoader);
      break;
    case 'worker':
      await startWorker(pluginLoader);
      break;
    case 'dev':
      await startServer(pluginLoader);
      await startWorker(pluginLoader, true); // Pass a flag to indicate dev mode
      break;
    default:
      logger.error('Unknown mode specified. Please set MODE to "server", "worker", or "dev".', loggerCtx);
  }
}

startApp();
