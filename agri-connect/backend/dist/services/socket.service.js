"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
class SocketService {
    constructor() {
        this.io = null;
    }
    init(io) {
        this.io = io;
        this.io.on('connection', (socket) => {
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
    emitToRoom(room, event, data) {
        if (this.io) {
            this.io.to(room).emit(event, data);
        }
    }
    // Broadcast to all
    broadcast(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}
exports.socketService = new SocketService();
