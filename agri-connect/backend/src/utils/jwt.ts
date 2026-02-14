import jwt from 'jsonwebtoken';
import { User, UserRole } from 'agri-connect-shared';

import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const EXPIRES_IN = env.JWT_EXPIRES_IN;
const REFRESH_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export const generateTokens = (user: User) => {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: EXPIRES_IN } as any);
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET as jwt.Secret, { expiresIn: REFRESH_EXPIRES_IN } as any);

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET as jwt.Secret) as TokenPayload;
    } catch (error) {
        return null;
    }
};
