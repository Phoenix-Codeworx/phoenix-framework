import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger.ts';
import env from '../config/config.ts';

const loggerCtx = { context: 'auth-middleware' };

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.error('Authorization header missing');
    return res.status(401).send('Authorization header missing');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.error('Token missing', loggerCtx);
    return res.status(401).send('Token missing');
  }

  try {
    const secret = env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload & { role: string };
    req.user = decoded; // Attach the user to the request object
    next();
  } catch (err) {
    logger.error('Invalid token:', err, loggerCtx);
    return res.status(401).send('Invalid token');
  }
};
