import 'reflect-metadata';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import { ApolloServer } from 'apollo-server-express';
import env from './config/config.js';
import logger from './config/logger.js';
import { authenticate } from './middleware/auth.js';
import { isIntrospectionQuery } from './utils/introspection-check.js';
import { shouldBypassAuth } from './utils/should-bypass-auth.js';
import sanitizeLog from './sanitize-log.js';
import { initializeSharedResources } from './shared.js';
import { startWorker } from './worker.js';
import { getEnforcer } from './rbac.js';
import PluginLoader from './plugins/plugin-loader.js';

const loggerCtx = { context: 'server' };

async function startServer(pluginLoader: PluginLoader) {
  try {
    const schema = await pluginLoader.createSchema();

    const server = new ApolloServer({
      schema,
      introspection: true,
      context: async ({ req }) => ({
        user: req.user,
        enforcer: await getEnforcer(),
        pluginsContext: pluginLoader.context,
      }),
    });

    await server.start();

    const app: Application = express();

    app.use(express.json());

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
          return next();
        }

        if (shouldBypassAuth(req.body.query)) {
          logger.verbose('Bypassing authentication due to excluded operation', loggerCtx);
          return next();
        }

        try {
          authenticate(req, res, next);
        } catch (error) {
          logger.error('Error parsing GraphQL query:', { error, query: req.body.query });
          authenticate(req, res, next);
        }
      } else {
        authenticate(req, res, next);
      }
      const sanitizedReqInfo = sanitizeLog(reqInfo);
      const logLine = JSON.stringify(sanitizedReqInfo, null, 0);
      logger.verbose(`reqInfo: ${logLine}`, loggerCtx);
    });

    server.applyMiddleware({ app });

    const port = env.PORT || 3000;
    await new Promise<void>((resolve) => {
      app.listen(port, () => {
        logger.info(`Server is running at http://localhost:${port}${server.graphqlPath}`, { context: 'server' });
        resolve();
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error, loggerCtx);
  }
}

export async function startApp(pluginDirs: string[]) {
  if (!pluginDirs) {
    throw new Error('pluginDirs must be provided');
  }

  const pluginLoader = await initializeSharedResources(pluginDirs);

  // Start the server
  await startServer(pluginLoader);
  // await startWorker(pluginDirs, env.MODE === 'dev');

  logger.info(`Server started, version 1.0.0`);
}
