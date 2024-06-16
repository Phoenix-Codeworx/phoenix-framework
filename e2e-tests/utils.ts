// e2e-tests/utils.ts
import { UserModel } from '../src/plugins/auth-plugin/models/user'; // Adjust the path as needed
import bcrypt from 'bcrypt';

export const initDB = async () => {
  const users = [
    { name: 'John Doe', email: 'john.doe@example.com', password: await bcrypt.hash('password123', 10) },
    { name: 'Jane Doe', email: 'jane.doe@example.com', password: await bcrypt.hash('password123', 10) },
    { name: 'Super User', email: 'superuser@example.com', password: await bcrypt.hash('superpassword', 10), role: 'superuser' },
  ];
  await UserModel.insertMany(users);
};

export const clearDB = async () => {
  await UserModel.deleteMany({});
};
