import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
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
  @WebSocketServer()
  server: Server;

  // Map pour stocker les agents connectés : agentId -> socketId
  private connectedAgents = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Supprimer l'agent de la map
    for (const [agentId, socketId] of this.connectedAgents.entries()) {
      if (socketId === client.id) {
        this.connectedAgents.delete(agentId);
        console.log(`Agent ${agentId} déconnecté`);
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
    console.log(`Agent ${data.agentName} (${data.agentId}) enregistré`);

    // Notifier les autres agents
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

    // Envoyer le message à tous les agents connectés
    this.server.emit('chat-message', messageWithTimestamp);
    return messageWithTimestamp;
  }

  // Méthode pour envoyer une notification de mission à un agent spécifique
  sendMissionNotification(notification: MissionNotificationDto) {
    console.log(
      `[ChatGateway] Envoi notification à agent: ${notification.agentId}`,
    );
    console.log(
      `[ChatGateway] Agents connectés:`,
      Array.from(this.connectedAgents.keys()),
    );

    const socketId = this.connectedAgents.get(notification.agentId);

    if (socketId) {
      // Envoyer uniquement à l'agent concerné
      this.server.to(socketId).emit('mission-notification', notification);
      console.log(`[ChatGateway] Notification envoyée à socket ${socketId}`);
    } else {
      console.log(
        `[ChatGateway] Agent ${notification.agentId} non connecté, broadcast à tous`,
      );
      this.server.emit('mission-notification', notification);
    }
  }

  // Méthode pour envoyer une notification à tous les agents
  broadcastMissionNotification(notification: MissionNotificationDto) {
    console.log(`[ChatGateway] Broadcast notification:`, notification.message);
    console.log(
      `[ChatGateway] Agents connectés:`,
      Array.from(this.connectedAgents.keys()),
    );
    this.server.emit('mission-notification', notification);
  }

  // Récupérer la liste des agents connectés
  getConnectedAgents(): string[] {
    return Array.from(this.connectedAgents.keys());
  }
}
