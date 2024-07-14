import { Resolver, Mutation, Arg, Query, Ctx } from 'type-graphql';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user';
import { User } from '../models/user';
import { UserService } from '../services/user-service.ts';
import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { getEnforcer } from '@phoenix-framework/core/src/rbac.js'
import env from '@phoenix-framework/core/src/config/config.js';

@Service() // Register AuthResolver with Typedi
@Resolver()
export class AuthResolver {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Arg('name') name: string,
    @Arg('role', { defaultValue: 'user' }) role: string, // Default role to 'user'
  ): Promise<User> {
    const user = this.userService.registerUser(name, email, password);
    return user;
  }

  @Mutation(() => String)
  async login(@Arg('email') email: string, @Arg('password') password: string): Promise<string> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ role: user.role, id: user._id }, process.env.JWT_SECRET!, { expiresIn: env.JTW_EXPIRY });
    return token;
  }

  @Query(() => [User])
  async users(@Ctx() context: any): Promise<User[]> {
    const enforcer = context.enforcer;
    const hasAccess = await enforcer.enforce(context.user.role, 'user', 'read');
    if (!hasAccess) {
      throw new Error('Not authorized');
    }
    return UserModel.find().exec();
  }

  @Mutation(() => Boolean)
  async addRole(
    @Arg('role') role: string,
    @Arg('permissions', () => [String]) permissions: string[],
  ): Promise<boolean> {
    const enforcer = await getEnforcer();
    for (const permission of permissions) {
      const [obj, act] = permission.split(':');
      await enforcer.addPolicy(role, obj, act);
    }
    return true;
  }

  @Mutation(() => Boolean)
  async assignRole(@Arg('userId') userId: string, @Arg('role') role: string): Promise<boolean> {
    const enforcer = await getEnforcer();
    await enforcer.addRoleForUser(userId, role);
    return true;
  }
}
