export enum MissionEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  STEP_ADDED = 'step_added',
  STEP_UPDATED = 'step_updated',
  STEP_DELETED = 'step_deleted',
  REPORT_ADDED = 'report_added',
  REPORT_UPDATED = 'report_updated',
  REPORT_DELETED = 'report_deleted',
}

export class MissionNotificationDto {
  missionId: string;
  eventType: MissionEventType;
  agentId: string;
  message: string;
  timestamp: Date;
}
