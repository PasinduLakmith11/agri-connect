import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { notifications } from '../database/schema';
import { eq, desc, count, and } from 'drizzle-orm';
import { socketService } from './socket.service';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    related_id?: string | null;
    is_read: number;
    created_at: string;
}

export class NotificationService {
    async create(data: { user_id: string; title: string; message: string; type: string; related_id?: string }): Promise<Notification> {
        if (!db) throw new Error('Database not initialized');
        const id = uuidv4();

        await db.insert(notifications).values({
            id,
            userId: data.user_id,
            title: data.title,
            message: data.message,
            type: data.type,
            relatedId: data.related_id || null,
        });

        const notificationRecord = (await db.select().from(notifications).where(eq(notifications.id, id)).limit(1))[0];

        const notification: Notification = {
            id: notificationRecord.id,
            user_id: notificationRecord.userId,
            title: notificationRecord.title,
            message: notificationRecord.message,
            type: notificationRecord.type,
            related_id: notificationRecord.relatedId,
            is_read: notificationRecord.isRead!,
            created_at: notificationRecord.createdAt?.toISOString() || '',
        };

        // Notify via socket
        socketService.emitToRoom(`user_${data.user_id}`, 'new_notification', notification);

        return notification;
    }

    async findByUser(userId: string): Promise<Notification[]> {
        if (!db) throw new Error('Database not initialized');
        const records = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        return records.map(r => ({
            id: r.id,
            user_id: r.userId,
            title: r.title,
            message: r.message,
            type: r.type,
            related_id: r.relatedId,
            is_read: r.isRead!,
            created_at: r.createdAt?.toISOString() || '',
        }));
    }

    async markAsRead(id: string, userId: string): Promise<void> {
        if (!db) throw new Error('Database not initialized');
        await db.update(notifications)
            .set({ isRead: 1 })
            .where(eq(notifications.id, id));
    }

    async markAllAsRead(userId: string): Promise<void> {
        if (!db) throw new Error('Database not initialized');
        await db.update(notifications)
            .set({ isRead: 1 })
            .where(eq(notifications.userId, userId));
    }

    async getUnreadCount(userId: string): Promise<number> {
        if (!db) throw new Error('Database not initialized');
        const result = await db.select({ value: count() })
            .from(notifications)
            .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));

        return Number(result[0].value);
    }
}
