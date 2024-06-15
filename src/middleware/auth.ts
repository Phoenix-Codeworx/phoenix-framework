import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger.ts';

const loggerCtx = 'auth-middleware';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const query = body.query || '';
  const mutation = body.mutation || '';

  // Check if the request body contains a query or mutation operation for register or login
  const isRegisterOrLogin = query.includes('register') || query.includes('login') || mutation.includes('register') || mutation.includes('login');
  const requestInfo = {
    query,
    mutation,
    body,
    isRegisterOrLogin
  };
  // logger.info(`Incoming GraphQL request in auth middleware: ${JSON.stringify(requestInfo, null, 2)}`, loggerCtx);

  if (isRegisterOrLogin) {
    logger.debug('Bypassing authentication for register/login');
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.error('Authorization header missing');
    return res.status(401).send('Authorization header missing');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.error('Token missing');
    return res.status(401).send('Token missing');
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload & { role: string };
    req.user = decoded; // Attach the user to the request object
    console.log('User authenticated:', req.user); // Log the authenticated user
    next();
  } catch (err) {
    console.log('Invalid token:', err);
    return res.status(401).send('Invalid token');
  }
};
