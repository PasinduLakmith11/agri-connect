import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

const notificationService = new NotificationService();

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const notifications = await notificationService.findByUser(req.user.userId);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        await notificationService.markAsRead(id, req.user.userId);
        res.json({ message: 'Marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        await notificationService.markAllAsRead(req.user.userId);
        res.json({ message: 'All marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const count = await notificationService.getUnreadCount(req.user.userId);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
