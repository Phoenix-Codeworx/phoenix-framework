import { Resolver, Query, Ctx, Arg, Mutation } from 'type-graphql';
import { User, UserModel } from '../entities/user';

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(@Ctx() context: any): Promise<User[]> {
    const enforcer = context.enforcer;
    const hasAccess = await enforcer.enforce(context.user.role, 'user', 'read');
    if (!hasAccess) {
      throw new Error('Not authorized');
    }
    return UserModel.find().exec();
  }

  @Mutation(() => User)
  async createUser(
    @Arg('name') name: string,
    @Arg('email') email: string,
    @Ctx() context: any
  ): Promise<User> {
    const enforcer = context.enforcer;
    const hasAccess = await enforcer.enforce(context.user.role, 'user', 'write');
    if (!hasAccess) {
      throw new Error('Not authorized');
    }
    const user = new UserModel({ name, email });
    await user.save();
    return user;
  }
}
