export class CreateMissionDto {
  codeName?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  classificationLevel?: string;
  encryptedData?: string;
  title: string;
  agentId?: string;
}
