import { Request, Response, NextFunction } from 'express';

export function checkCsrf(req: Request, res: Response, next: NextFunction) {
  const clientToken = req.headers['x-csrf-token'];
  const serverToken = req.cookies['csrf_token'];

  if (!clientToken || !serverToken || clientToken !== serverToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
}