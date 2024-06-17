import { AuthResolver } from './resolvers/auth-resolver';
import type { Plugin } from '../plugin-interface';
import FunctionRegistry from '../function-registry';
import { type GlobalContext } from '../global-context';
import logger from '../../config/logger.ts';

const loggerCtx = { context: 'auth-plugin/register' };

const authPlugin: Plugin = {
  name: 'auth-plugin',
  type: 'authorization',
  resolvers: [AuthResolver],
  register: (container: any, context: GlobalContext) => {
    // Register resolvers
    context.resolvers['Auth'] = authPlugin.resolvers ?? [];

    // Perform any additional registration if necessary
    const functionRegistry = FunctionRegistry.getInstance();
    functionRegistry.registerFunction('user', () => logger.debug('User function called', loggerCtx));
  },
};

export default authPlugin;
