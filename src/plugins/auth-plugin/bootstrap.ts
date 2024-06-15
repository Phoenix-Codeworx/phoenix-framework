import bcrypt from 'bcrypt';
import { UserModel } from './entities/user';
import { getEnforcer } from '../../rbac';
import logger from '../../config/logger';

export const bootstrap = async () => {
  const userCount = await UserModel.countDocuments({});
  if (userCount === 0) {
    const superuser = new UserModel({
      email: 'superuser@example.com',
      password: await bcrypt.hash('superpassword', 10), // Use a secure password
      name: 'Super User',
      role: 'superadmin'
    });
    await superuser.save();

    const enforcer = await getEnforcer();
    await enforcer.addRoleForUser(superuser._id.toString(), 'superadmin');

    // Check if the superadmin role already has the necessary permissions
    const permissions = [
      ['superadmin', 'user', 'read'],
      ['superadmin', 'user', 'write'],
      ['superadmin', 'data', 'read'],
      ['superadmin', 'data', 'write']
      // Add more permissions as needed
    ];

    for (const [role, obj, act] of permissions) {
      const exists = await enforcer.hasPolicy(role, obj, act);
      if (!exists) {
        await enforcer.addPolicy(role, obj, act);
      }
    }

    logger.info('Superuser created with email: superuser@phoenix.com');
  } else {
    logger.info('Users already exist. No superuser created.');
  }
};
