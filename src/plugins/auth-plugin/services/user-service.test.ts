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

  it('should return all users using UserService', async () => {
    const mockUsers: User[] = [
      { name: 'John Doe', email: 'john@example.com', password: 'password1', role: 'user' },
      { name: 'Jane Doe', email: 'jane@example.com', password: 'password2', role: 'user' },
    ];

    when(userModelMock.find()).thenReturn({
      exec: () => Promise.resolve(mockUsers),
    } as any);

    UserModel.find = instance(userModelMock).find;

    const users = await userService.getAllUsers();
    expect(users).toEqual(mockUsers);
  });
});
