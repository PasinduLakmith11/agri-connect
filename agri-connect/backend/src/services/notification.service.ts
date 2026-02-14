import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { socketService } from './socket.service';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    related_id?: string;
    is_read: number;
    created_at: string;
}

export class NotificationService {
    async create(data: { user_id: string; title: string; message: string; type: string; related_id?: string }): Promise<Notification> {
        const id = uuidv4();

        db.prepare(`
            INSERT INTO notifications (id, user_id, title, message, type, related_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, data.user_id, data.title, data.message, data.type, data.related_id || null);

        const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as Notification;

        // Notify via socket
        socketService.emitToRoom(`user_${data.user_id}`, 'new_notification', notification);

        return notification;
    }

    async findByUser(userId: string): Promise<Notification[]> {
        return db.prepare(`
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        `).all(userId) as Notification[];
    }

    async markAsRead(id: string, userId: string): Promise<void> {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
    }

    async markAllAsRead(userId: string): Promise<void> {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
    }

    async getUnreadCount(userId: string): Promise<number> {
        const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { count: number };
        return result.count;
    }
}
