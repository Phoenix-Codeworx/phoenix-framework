// e2e-tests/login.ts
import request from 'supertest';

export const login = async (app: any) => {
  const res = await request(app)
    .post('/graphql')
    .send({
      query: `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password)
        }
      `,
      variables: {
        email: "superuser@example.com",
        password: "superpassword"
      },
    });

  if (!res.body.data || !res.body.data.login) {
    throw new Error('Login failed or token not returned');
  }

  return res.body.data.login;
};
