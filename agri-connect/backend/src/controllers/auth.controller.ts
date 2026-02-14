import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterSchema, LoginSchema } from 'agri-connect-shared';
import { z } from 'zod';

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    try {
        const data = RegisterSchema.parse(req.body);
        const result = await authService.register(data);
        res.status(201).json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as z.ZodError).errors });
        }
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const data = LoginSchema.parse(req.body);
        const result = await authService.login(data);
        res.json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as z.ZodError).errors });
        }
        res.status(401).json({ message: error.message });
    }
};

export const me = (req: Request, res: Response) => {
    // req.user is set by authenticate middleware
    res.json(req.user);
};
