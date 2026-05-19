import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConversationsService } from './conversations.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/conversations',
})
export class ConversationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private conversationsService: ConversationsService,
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as { token?: string }).token ||
        (client.handshake.headers.authorization || '').replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup if needed
    void client;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId);
    return { event: 'joinedRoom', data: conversationId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    const userId: string = client.data.userId;
    if (!userId || !payload?.conversationId || !payload?.content?.trim()) {
      return { error: 'Invalid payload' };
    }

    const msg = await this.conversationsService.addMessage(
      payload.conversationId,
      userId,
      payload.content.trim(),
    );

    // Broadcast to all clients in the room (including sender)
    this.server.to(payload.conversationId).emit('newMessage', msg);

    // Notify the other participant if they are not in the room
    const conv = await this.conversationsService.findById(payload.conversationId);
    if (conv) {
      const recipientId = conv.userId === userId ? conv.photographer?.userId : conv.userId;
      if (recipientId && recipientId !== userId) {
        const roomSockets = await this.server.in(payload.conversationId).fetchSockets();
        const recipientOnline = roomSockets.some((s) => s.data.userId === recipientId);
        if (!recipientOnline) {
          await this.notificationsService.create(
            recipientId,
            'message',
            'New message',
            payload.content.trim().slice(0, 80),
            '/conversations',
          );
        }
      }
    }

    return msg;
  }
}
