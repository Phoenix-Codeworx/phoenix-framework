import { Resolver, Mutation, Arg } from 'type-graphql';
import bcrypt from 'bcrypt';
import { UserModel } from '../../user-plugin/entities/user';
import logger from '../../../config/logger';
import { User } from '../entities/user'; // Ensure this path is correct
import { Service } from 'typedi';
import jwt from 'jsonwebtoken';

const loggerCtx = 'auth-resolver';

@Service() // Register AuthResolver with Typedi
@Resolver()
export class AuthResolver {
  @Mutation(() => User)
  async register(
    @Arg('email') username: string,
    @Arg('password') password: string,
    @Arg('name') name: string
  ): Promise<User> {
    logger.info(`Registering user: ${name}`, loggerCtx);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ username, password: hashedPassword, name, role: 'user' });
    await user.save();
    return user;
  }

  @Mutation(() => String)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string
  ): Promise<string> {
    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ role: user.role, id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return token;
  }
}
