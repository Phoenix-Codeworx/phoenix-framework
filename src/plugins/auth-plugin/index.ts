import { AuthResolver } from './resolvers/auth-resolver';
import type { Plugin } from '../plugin-interface';
import FunctionRegistry from '../function-registry';
import { type GlobalContext } from '../global-context';

const authPlugin: Plugin = {
  name: 'auth-plugin',
  type: 'authorization',
  resolvers: [AuthResolver],
  register: (container: any, context: GlobalContext) => {
    // Register resolvers
    context.resolvers['Auth'] = authPlugin.resolvers ?? [];

    // Perform any additional registration if necessary
    const functionRegistry = FunctionRegistry.getInstance();
    functionRegistry.registerFunction('user', () => console.log('User function called'));
  },
};

export default authPlugin;
