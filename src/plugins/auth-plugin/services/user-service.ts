import { Service } from 'typedi';
import { User, UserModel } from '../entities/user';

@Service()
export class UserService {
  async getAllUsers(): Promise<User[]> {
    return UserModel.find().exec();
  }

  async createUser(name: string, email: string): Promise<User> {
    const user = new UserModel({ name, email });
    return user.save();
  }
}
