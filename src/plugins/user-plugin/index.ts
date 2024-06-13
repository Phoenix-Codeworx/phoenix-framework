import { UserResolver } from './resolvers/user-resolver';
import type { Plugin } from '../plugin-interface';
import FunctionRegistry from '../function-registry';

const userPlugin: Plugin = {
  name: 'User Plugin',
  type: 'user',
  resolvers: [UserResolver],
  register: (container: any) => {
    // Perform any additional registration if necessary
    const functionRegistry = FunctionRegistry.getInstance();
    functionRegistry.registerFunction('user', () => console.log('User function called'));
  },
};

export default userPlugin;
