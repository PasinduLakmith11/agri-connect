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
        // Log detailed error information
        console.error('❌ Registration Error:');
        console.error('   Message:', error.message);
        console.error('   Name:', error.name);
        console.error('   Code:', error.code);
        if (error.stack) {
            console.error('   Stack:', error.stack);
        }

        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as z.ZodError).errors });
        }

        // Send detailed error to client for debugging
        res.status(400).json({
            message: error.message,
            error: error.name,
            code: error.code
        });
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

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        const tokens = await authService.refreshToken(refreshToken);
        res.json(tokens);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const me = (req: Request, res: Response) => {
    // req.user is set by authenticate middleware
    res.json(req.user);
};
