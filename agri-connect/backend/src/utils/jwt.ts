import jwt from 'jsonwebtoken';
import { User, UserRole } from 'agri-connect-shared';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

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
