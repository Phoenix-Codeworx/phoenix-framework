import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger.ts';

const loggerCtx = 'auth-middleware';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
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
    next();
  } catch (err) {
    console.log('Invalid token:', err);
    return res.status(401).send('Invalid token');
  }
};