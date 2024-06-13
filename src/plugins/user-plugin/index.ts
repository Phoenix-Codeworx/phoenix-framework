import { UserResolver } from './resolvers/user-resolver';

const userPlugin = {
  name: 'User Plugin',
  type: 'auth',
  resolvers: [UserResolver],
  register: (container: any) => {
    // Perform any additional registration if necessary
  },
};

export default userPlugin;

