import { describe, it, beforeEach, afterEach } from 'bun:test';
import { expect } from 'chai';
import { setup } from '../setup';
import { teardown } from '../teardown';
import { initDB, clearDB } from '../utils';
import { login } from '../login';
import request from 'supertest';

let app: any;
let token: string;

beforeEach(async () => {
  app = await setup();
  await initDB();
  token = await login(app);
});

afterEach(async () => {
  await clearDB();
  await teardown();
});

describe('User Queries', () => {
  it('should return a list of users', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          query {
            users {
              name
              email
            }
          }
        `,
      })
      .expect(200);
    expect(res.body.data.users).to.have.lengthOf(3);
    expect(res.body.data.users).to.deep.equal([
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Doe', email: 'jane.doe@example.com' },
      { name: 'Super User', email: 'superuser@example.com' },
    ]);
  });
});
