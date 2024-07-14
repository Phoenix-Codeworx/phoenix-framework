import { AuthResolver } from './resolvers/auth-resolver.js';
import { type Plugin } from '@phoenix-framework/core/src/plugins/plugin-interface.js';
import FunctionRegistry from '@phoenix-framework/core/src/plugins/function-registry.js';
import { type GlobalContext } from '@phoenix-framework/core/src/plugins/global-context.js';
import logger from '@phoenix-framework/core/src/config/logger.js';

const loggerCtx = { context: 'auth-plugin/register' };

const authPlugin: Plugin = {
  name: 'auth-plugin',
  type: 'authorization',
  resolvers: [AuthResolver],
  register: (container, context: GlobalContext) => {
    // Register resolvers
    context.resolvers['Auth'] = authPlugin.resolvers ?? [];

    // Perform any additional registration if necessary
    const functionRegistry = FunctionRegistry.getInstance();
    functionRegistry.registerFunction('user', () => logger.debug('User function called', loggerCtx));
  },
};

export default authPlugin;
