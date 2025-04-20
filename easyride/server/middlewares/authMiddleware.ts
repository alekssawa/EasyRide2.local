import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для проверки, авторизован ли пользователь.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: 'Користувач не авторизований' });
};
