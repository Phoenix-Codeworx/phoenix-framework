import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import sinon from 'sinon';
import { UserService } from '../../src/plugins/user-plugin/services/user-service';
import { UserModel } from '../../src/plugins/user-plugin/entities/user';

describe('UserService', () => {
  let userService: UserService;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    userService = new UserService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create a user', async () => {
    const stub = sandbox.stub(UserModel.prototype as any, 'save').resolves({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    const user = await userService.createUser('John Doe', 'john.doe@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
    expect(stub.calledOnce).toBe(true);
  });

  it('should get all users', async () => {
    const stub = sandbox.stub(UserModel, 'find').returns({
      exec: sandbox.stub().resolves([
        { name: 'John Doe', email: 'john.doe@example.com' },
      ]),
    } as any);

    const users = await userService.getAllUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('John Doe');
    expect(users[0].email).toBe('john.doe@example.com');
    expect(stub.calledOnce).toBe(true);
  });
});
