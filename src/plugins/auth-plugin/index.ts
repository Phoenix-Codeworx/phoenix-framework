import { AuthResolver } from './resolvers/auth-resolver';
import type { Plugin } from '../plugin-interface';
import FunctionRegistry from '../function-registry';

const authPlugin: Plugin = {
  name: 'AuthPlugin',
  type: 'authorization',
  resolvers: [AuthResolver],
  register: (container: any) => {
    // Perform any additional registration if necessary
    const functionRegistry = FunctionRegistry.getInstance();
    functionRegistry.registerFunction('user', () => console.log('User function called'));
  },
};

export default authPlugin;
