import { Service } from 'typedi';
import { User, UserModel } from '../entities/user';
import bcrypt from 'bcrypt';
import { getEnforcer } from '../../../rbac.ts';

@Service()
export class UserService {
  public async getAllUsers(): Promise<User[]> {
    return UserModel.find().exec();
  }

  public async registerUser(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPassword, role : 'user'});
    // Add user-role mapping to Casbin
    const enforcer = await getEnforcer();
    await enforcer.addRoleForUser(user._id.toString(), 'user');
    return user.save();
  }
}
