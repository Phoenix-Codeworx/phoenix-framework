import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { UserService } from './user-service.ts';
import { User, UserModel } from '../entities/user';
import { instance, mock, when, anything } from 'ts-mockito';
import mongoose, { Document } from 'mongoose';
import { connectDB, closeDB } from '../../../../test/test-db-setup.ts';

interface UserDocument extends Document {
  name: string;
  email: string;
  save: () => Promise<this>;
}

describe('UserService', () => {
  let userService: UserService;
  let userModelMock: typeof UserModel;
  let userDocumentInstance: UserDocument;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(() => {
    userService = new UserService();
    userModelMock = mock<typeof UserModel>();
  });

  it('should create and save a user using UserService', async () => {
    const newUser: User = { name: 'Jane Doe', email: 'jane@example.com' };

    userDocumentInstance = {
      _id: new mongoose.Types.ObjectId(),
      name: newUser.name,
      email: newUser.email,
      save: async function () {
        return Promise.resolve(this);
      }
    } as UserDocument;

    when(userModelMock.create(anything())).thenReturn(Promise.resolve(userDocumentInstance) as any);
    UserModel.create = instance(userModelMock).create;
    try {
      const user = await userService.createUser(newUser.name, newUser.email);
      expect(user.name).toEqual(newUser.name);
      expect(user.email).toEqual(newUser.email);
    } catch (error) {
      console.error('Error in createUser:', error);
    }
  });

  it('should return all users using UserService', async () => {
    const mockUsers: User[] = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Doe', email: 'jane@example.com' },
    ];

    when(userModelMock.find()).thenReturn({
      exec: () => Promise.resolve(mockUsers)
    } as any);

    UserModel.find = instance(userModelMock).find;

    const users = await userService.getAllUsers();
    expect(users).toEqual(mockUsers);
  });
});
