import { Request, Response, NextFunction } from 'express'
import { verifyJWT } from "../utils/jwt"; // ini handle RS256 atau HS256


interface UserPayload {
  id: number;
  role?: string;
  kode_wh?: string;
}
// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const { valid, expired, decoded } = verifyJWT(token);

  if (!valid) {
    return res.status(403).json({
      message: expired ? "Token expired" : "Invalid token"
    });
  }

  req.user = decoded;
  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  if (!user) {
    return res.status(403).json({
      status: false,
      statusCode: 403,
      message: 'Forbidden',})
  }
  return next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      status: false,
      statusCode: 403,
      message: 'Forbidden',})
  }
  return next()
}

export const requireManager = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  if (!user || user.role !== 'manager') {
    return res.status(403).json({
      status: false,
      statusCode: 403,
      message: 'Forbidden',})
  }
  return next()
}

export const requireCsrf = (req: Request, res: Response, next: NextFunction) => {
  const clientToken = req.headers['x-csrf-token'] as string;
  const serverToken = req.cookies['XSRF-TOKEN'] as string;

  if (!clientToken || !serverToken || clientToken !== serverToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
}