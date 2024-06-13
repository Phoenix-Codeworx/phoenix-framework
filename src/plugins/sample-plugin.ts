import { Service } from 'typedi';
import type { Plugin } from './plugin';
import { User } from '../entities/user';
import { UserModel } from '../entities/user';
import { eventSystem } from '../event/event-system';
import { Container } from 'typedi';
import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';
import type {
  GraphQLFieldConfigMap,
  GraphQLSchema,
} from 'graphql';

@Service()
class SamplePlugin implements Plugin {
  register(container: typeof Container) {
    container.set('UserModel', UserModel);
  }

  registerResolvers(schema: GraphQLSchema) {
    // This method is required by the Plugin interface but is not used in this example.
    // You can implement it as needed for your specific use case.
  }

  registerEventHandlers() {
    eventSystem.on('userCreated', (user: User) => {
      console.log(`User created: ${user.name}`);
    });
  }

  getResolver() {
    const userType = new GraphQLObjectType({
      name: 'User',
      fields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
    });

    const query: GraphQLFieldConfigMap<any, any> = {
      users: {
        type: new GraphQLList(userType),
        resolve: async () => UserModel.find().exec(),
      },
    };

    const mutation: GraphQLFieldConfigMap<any, any> = {
      createUser: {
        type: userType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (_: any, { name, email }: { name: string; email: string }) => {
          const user = new UserModel({ name, email });
          await user.save();
          eventSystem.emit('userCreated', user);
          return user;
        },
      },
    };

    return { query, mutation };
  }
}

export const samplePlugin = new SamplePlugin();
