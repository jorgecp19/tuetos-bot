import { Request, Response, NextFunction } from "express";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    next();
}

export default authMiddleware;
