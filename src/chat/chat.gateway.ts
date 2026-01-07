import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatMessageDto } from './dto/chat-message.dto';
import { MissionNotificationDto } from '../mission/dto/mission-notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  private connectedAgents = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [agentId, socketId] of this.connectedAgents.entries()) {
      if (socketId === client.id) {
        this.connectedAgents.delete(agentId);
        this.logger.log(`Agent ${agentId} déconnecté`);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { agentId: string; agentName: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedAgents.set(data.agentId, client.id);
    this.logger.log(`Agent ${data.agentName} (${data.agentId}) enregistré`);

    client.broadcast.emit('agent-connected', {
      agentId: data.agentId,
      agentName: data.agentName,
    });

    return { success: true, message: 'Enregistré avec succès' };
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(@MessageBody() data: ChatMessageDto) {
    const messageWithTimestamp = {
      ...data,
      timestamp: new Date(),
    };

    this.server.emit('chat-message', messageWithTimestamp);
    return messageWithTimestamp;
  }

  sendMissionNotification(notification: MissionNotificationDto) {
    const socketId = this.connectedAgents.get(notification.agentId);

    if (socketId) {
      this.server.to(socketId).emit('mission-notification', notification);
      this.logger.debug(`Notification envoyée à agent ${notification.agentId}`);
    } else {
      this.logger.debug(
        `Agent ${notification.agentId} non connecté, broadcast`,
      );
      this.server.emit('mission-notification', notification);
    }
  }

  broadcastMissionNotification(notification: MissionNotificationDto) {
    this.server.emit('mission-notification', notification);
  }

  getConnectedAgents(): string[] {
    return Array.from(this.connectedAgents.keys());
  }
}
