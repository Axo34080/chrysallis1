export enum MissionEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class MissionNotificationDto {
  missionId: string;
  eventType: MissionEventType;
  agentId: string;
  message: string;
  timestamp: Date;
}
