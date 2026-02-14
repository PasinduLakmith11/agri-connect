import { Server, Socket } from 'socket.io';

class SocketService {
    private io: Server | null = null;

    init(io: Server) {
        this.io = io;
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join_room', (room) => {
                socket.join(room);
                console.log(`Socket ${socket.id} joined room ${room}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    // Emit event to specific room (e.g., specific user or role)
    emitToRoom(room: string, event: string, data: any) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }

    // Broadcast to all
    broadcast(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

export const socketService = new SocketService();
