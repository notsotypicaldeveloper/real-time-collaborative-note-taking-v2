import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

interface ConnectedUser {
  userId: string;
  ws: WebSocket;
  noteId?: string;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private connectedUsers: ConnectedUser[] = [];

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'JOIN_NOTE':
            this.handleJoinNote(ws, data);
            break;
          case 'NOTE_UPDATE':
            this.handleNoteUpdate(data);
            break;
          case 'USER_CONNECTED':
            this.handleUserConnection(ws, data);
            break;
        }
      });

      ws.on('close', () => {
        this.handleUserDisconnection(ws);
      });
    });
  }

  private handleJoinNote(ws: WebSocket, data: any) {
    const user = this.connectedUsers.find(u => u.ws === ws);
    if (user) {
      user.noteId = data.noteId;
      this.broadcastToNote(data.noteId, {
        type: 'USER_JOINED_NOTE',
        userId: user.userId,
      });
    }
  }

  private handleNoteUpdate(data: any) {
    this.broadcastToNote(data.noteId, {
      type: 'NOTE_UPDATED',
      content: data.content,
      userId: data.userId,
    });
  }

  private handleUserConnection(ws: WebSocket, data: any) {
    this.connectedUsers.push({
      userId: data.userId,
      ws,
    });
    this.broadcastUserList();
  }

  private handleUserDisconnection(ws: WebSocket) {
    const index = this.connectedUsers.findIndex(u => u.ws === ws);
    if (index !== -1) {
      this.connectedUsers.splice(index, 1);
      this.broadcastUserList();
    }
  }

  private broadcastToNote(noteId: string, data: any) {
    const users = this.connectedUsers.filter(u => u.noteId === noteId);
    users.forEach(user => {
      user.ws.send(JSON.stringify(data));
    });
  }

  private broadcastUserList() {
    const userList = this.connectedUsers.map(u => u.userId);
    this.connectedUsers.forEach(user => {
      user.ws.send(JSON.stringify({
        type: 'USERS_ONLINE',
        users: userList,
      }));
    });
  }
} 